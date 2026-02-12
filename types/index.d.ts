export type RequestDetails = Browser.webRequest.WebRequestDetails;

export type ContentScriptConnectInfo = {
  name: 'content-script'
}

export type ContentScriptPort = Browser.runtime.Port & ContentScriptConnectInfo;

export type BackgroundState = {
  activated: boolean,
  tabId: number,
  bufferSize: number,
  maxBufferSize: number,
}

export type StateMessage = {
  action: 'state',
  data: BackgroundState
}

export type RequestsMessage = {
  action: 'requests',
  data: RequestDetails[]
}

export type SetActivatedMessage = {
  action: 'set-activated',
  data: boolean
}

export type GetStateMessage = {
  action: 'get-state'
}

export type Message = StateMessage | RequestsMessage | SetActivatedMessage | GetStateMessage;
