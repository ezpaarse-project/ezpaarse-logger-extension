import { browser } from 'wxt/browser';

import type { Message, RequestsMessage, ContentScriptConnectInfo } from '@/types';

export default defineContentScript({
  matches: [
    '*://localhost/*',
    '*://analyses.ezpaarse.org/*',
    '*://analyses-preprod.ezpaarse.org/*',
  ],
  main() {
    let port: Browser.runtime.Port;

    const isRequestsMessage = (message: Message): message is RequestsMessage => {
      const msg = message as RequestsMessage;
      return msg.action === 'requests' && Array.isArray(msg.data);
    };

    /**
     * Handle messages from the background script
     * @param message - The message
     */
    const onMessage = (message: Message) => {
      if (isRequestsMessage(message)) {
        message.data.forEach(detail => {
          document.dispatchEvent(
            new CustomEvent('ezlogger-request', { detail: JSON.stringify(detail) }),
          );
        });
      }
    }

    /**
     * Connect to the background script
     * If connection fails, retry after 1 second
     */
    const connect = () => {
      port = browser.runtime.connect({ name: 'content-script' } as ContentScriptConnectInfo);

      port.onDisconnect.addListener(() => {
        setTimeout(() => connect(), 1000);
      });

      port.onMessage.addListener(onMessage);
    };

    connect();
  },
});
