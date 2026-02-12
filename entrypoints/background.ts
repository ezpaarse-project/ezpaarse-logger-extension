import { storage } from '#imports';
import { browser } from 'wxt/browser';

import type {
  RequestDetails,
  RequestsMessage,
  Message,
  StateMessage,
  ContentScriptPort,
} from '@/types';

const IDLE_TIMEOUT = 5000;
const MAX_BUFFER_SIZE = 1000;

const icons = {
  enabled: {
    16: 'icon/16.png',
    32: 'icon/32.png',
    48: 'icon/48.png',
    96: 'icon/96.png',
    128: 'icon/128.png'
  },
  disabled: {
    16: 'icon/16-disabled.png',
    32: 'icon/32-disabled.png',
    48: 'icon/48-disabled.png',
    96: 'icon/96-disabled.png',
    128: 'icon/128-disabled.png'
  }
};

export default defineBackground(async () => {
  let contentScriptPort: Browser.runtime.Port | undefined;
  let contentScriptTabId: Number | undefined;
  let idleTimeoutId: number | NodeJS.Timeout;

  let buffer = [...(await storage.getItem<RequestDetails[]>('session:requests') ?? [])];
  const activated = await storage.getItem<boolean>('local:activated');

  await setActivated(activated === undefined ? true : !!activated);

  browser.runtime.onConnect.addListener(onConnect);
  browser.runtime.onMessage.addListener(onMessage);

  /**
   * Use in-RAM session storage to persist requests
   * @returns Promise<void>
   */
  function persistRequests() {
    return storage.setItem<RequestDetails[]>('session:requests', buffer);
  }

  /**
   * Put captured request in the buffer while waiting for the content script to connect
   * @param details - request details
   */
  function bufferizeRequest(details: RequestDetails) {
    buffer.push(details);

    if (buffer.length > MAX_BUFFER_SIZE) {
      buffer = buffer.slice(-MAX_BUFFER_SIZE);
    }
  }

  /**
   * Send the buffered requests to the content script
   */
  function sendBufferedRequests() {
    if (contentScriptPort && buffer.length > 0) {
      contentScriptPort.postMessage({ action: 'requests', data: buffer } as RequestsMessage);
      buffer = [];
    }
  }

  /**
   * Check if the port is the one used to communicate with the content script
   * @param port - The port to check
   */
  function isContentScriptPort(port: Browser.runtime.Port): port is ContentScriptPort {
    return (port as ContentScriptPort).name === 'content-script';
  }

  /**
   * Handle connections from the content script
   * @param port - The port used to communicate with the content script
   */
  function onConnect(port: Browser.runtime.Port) {
    if (contentScriptPort || !isContentScriptPort(port)) { return; }

    contentScriptPort = port;
    contentScriptTabId = port.sender?.tab?.id;

    port.onDisconnect.addListener(() => {
      contentScriptPort = undefined;
      contentScriptTabId = undefined;
    });

    sendState();
    sendBufferedRequests();
  }

  /**
   * Handle messages from the popup
   * @param message - The message
   */
  function onMessage(message: Message) {
    if (message?.action === 'get-state') {
      sendState();
    } else if (message?.action === 'set-activated') {
      setActivated(!!message.data);
    }
  }

  /**
   * Enable or disable the extension by adding/removing the network listener
   * @param {Boolean} activated
   */
  async function setActivated(activated: boolean) {
    activated = !!activated;

    (browser.action ?? browser.browserAction).setIcon({ path: activated ? icons.enabled : icons.disabled });

    if (!activated) {
      browser.webRequest.onCompleted.removeListener(networkListener);
      browser.webRequest.onBeforeRedirect.removeListener(networkListener);
    } else if (!isListening()) {
      browser.webRequest.onCompleted.addListener(networkListener, { urls: ['*://*/*'] }, ['responseHeaders']);
      browser.webRequest.onBeforeRedirect.addListener(networkListener, { urls: ['*://*/*'] }, ['responseHeaders']);
    }

    await storage.setItem('local:activated', activated);
    sendState();
  }

  /**
   * Notify the popup about the current state
   */
  function sendState() {
    browser.runtime.sendMessage({
      action: 'state',
      data: {
        activated: isListening(),
        tabId: contentScriptTabId,
        bufferSize: buffer.length,
        maxBufferSize: MAX_BUFFER_SIZE
      }
    } as StateMessage);
  }

  /**
   * Check whether the network is being listened or not
   * @return {Boolean}
   */
  function isListening() {
    return browser.webRequest.onCompleted.hasListener(networkListener);
  }

  /**
   * Reset the idle timeout. If there is no activity until the timeout expires, persist the requests.
   */
  function resetIdleTimeout() {
    clearTimeout(idleTimeoutId);
    idleTimeoutId = setTimeout(persistRequests, IDLE_TIMEOUT);
  }

  /**
   * Network listener, send request details to the web app
   * @param  {RequestDetails} details  request details
   */
  function networkListener(details: RequestDetails) {
    if (details.tabId === contentScriptTabId) {
      return;
    }

    resetIdleTimeout();

    if (!contentScriptPort) {
      bufferizeRequest(details);
      return;
    }

    try {
      contentScriptPort.postMessage({ action: 'requests', data: [details] } as RequestsMessage);
    } catch {
      contentScriptPort = undefined;
      contentScriptTabId = undefined;
      bufferizeRequest(details);
    }
  }
});
