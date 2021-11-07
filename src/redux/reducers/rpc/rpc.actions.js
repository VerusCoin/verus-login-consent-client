import {
  ADD_CALLED_TIME,
  SET_RPC_APP_ID,
  SET_RPC_LOGIN_CONSENT_REQUEST,
  SET_RPC_EXPIRY_MARGIN,
  SET_RPC_PASSWORD,
  SET_RPC_PORT,
  SET_RPC_POST_ENCRYPTION,
  SET_RPC_WINDOW_ID,
} from "./rpc.types";

export const setRpcAppId = (appId) => {
  return {
    type: SET_RPC_APP_ID,
    payload: {
      appId
    }
  }
}

export const setRpcPassword = (password) => {
  return {
    type: SET_RPC_PASSWORD,
    payload: {
      password
    }
  }
}

export const setRpcPort = (port) => {
  return {
    type: SET_RPC_PORT,
    payload: {
      port
    }
  }
}

export const setRpcExpiryMargin = (expiryMargin) => {
  return {
    type: SET_RPC_EXPIRY_MARGIN,
    payload: {
      expiryMargin
    }
  }
}

export const addCalledTime = (time) => {
  return {
    type: ADD_CALLED_TIME,
    payload: {
      time
    }
  }
}

export const setRpcPostEncryption = (encryption) => {
  return {
    type: SET_RPC_POST_ENCRYPTION,
    payload: {
      encryption
    }
  }
}

export const setRpcWindowId = (windowId) => {
  return {
    type: SET_RPC_WINDOW_ID,
    payload: {
      windowId
    }
  }
}

export const setRpcLoginConsentRequest = (loginConsentRequest) => {
  return {
    type: SET_RPC_LOGIN_CONSENT_REQUEST,
    payload: {
      loginConsentRequest
    }
  }
}