import {
  GENERIC_REQUEST_DEEPLINK_VDXF_KEY,
  GenericRequest,
  LOGIN_CONSENT_REQUEST_VDXF_KEY,
  LoginConsentRequest,
  VerusPayInvoice,
} from 'verus-typescript-primitives';

import {DEVMODE, MOCK_IPC} from '#/env';
import {setMainChain} from '#/redux/reducers/chainMetadata/chainMetadata.actions';
import {setDeeplinkData} from '#/redux/reducers/deeplink/deeplinkSlice';
import {setError} from '#/redux/reducers/error/error.actions';
import {setOriginAppBuiltin, setOriginAppId} from '#/redux/reducers/origin/origin.actions';
import {
  setRpcExpiryMargin,
  setRpcPassword,
  setRpcPort,
  setRpcPostEncryption,
  setRpcWindowId,
} from '#/redux/reducers/rpc/rpcSlice';
import store from '#/redux/store';
import {
  IPC_INIT_MESSAGE,
  IPC_LOGIN_CONSENT_REQUEST_METHOD,
  IPC_ORIGIN_DEV,
  IPC_ORIGIN_DEV_LOCALHOST,
  IPC_PACKAGED_ENTRY_PATH,
  IPC_PUSH_MESSAGE,
} from '#/utils/constants';
import {RPC_PASSWORD, RPC_PORT} from '#/utils/mocks';

import type {IpcInitMessage, IpcMessage, IpcPushMessage} from './types';

const parseDeeplinkByType = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deeplinkRawData: any,
  deeplinkId: string
): LoginConsentRequest | VerusPayInvoice | GenericRequest => {
  // Always use fromJson or other similar methods when possible as some of the deeplink data has a
  // different representation between JSON and the class definition.
  switch (deeplinkId) {
    case LOGIN_CONSENT_REQUEST_VDXF_KEY.vdxfid:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new LoginConsentRequest(deeplinkRawData as any);

    case GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid: {
      // The generic request is sent as the hex string of the buffer.
      const req = new GenericRequest();
      req.fromBuffer(Buffer.from(deeplinkRawData, 'hex'));
      return req;
    }
    default:
      throw new Error(`Unsupported deeplink ID: ${deeplinkId}`);
  }
};

const updateReduxStore = (data: IpcPushMessage): void => {
  // Add the name of daemon guaranteed to be running on desktop so
  // it can be used to look up other chains.
  store.dispatch(setMainChain(data.data.origin_app_info.main_chain_ticker));

  const deeplinkData = parseDeeplinkByType(data.data.deeplink.data, data.data.deeplink.id);

  store.dispatch(
    setDeeplinkData({
      id: data.data.deeplink.id,
      data: deeplinkData,
      provisioningCapability: data.data.provisioning_capability ?? null,
    })
  );

  store.dispatch(setOriginAppBuiltin(data.data.origin_app_info.search_builtin));
  store.dispatch(setOriginAppId(data.data.origin_app_info.id));
};

const setupRpcConfig = (data: IpcInitMessage | null = null): void => {
  try {
    if (MOCK_IPC) {
      store.dispatch(setRpcExpiryMargin(60000));
      store.dispatch(setRpcPort(RPC_PORT));
      store.dispatch(setRpcPostEncryption(true));
      store.dispatch(setRpcWindowId(1));
      store.dispatch(setRpcPassword(RPC_PASSWORD));
    } else {
      if (data) {
        store.dispatch(setRpcExpiryMargin(data.data.expiry_margin));
        store.dispatch(setRpcPort(data.data.rpc_port));
        store.dispatch(setRpcPostEncryption(data.data.post_encryption));
        store.dispatch(setRpcWindowId(data.data.window_id));
      }
      store.dispatch(setRpcPassword(window.bridge.getSecretSync().BuiltinSecret));
    }
  } catch (e) {
    console.error('Error loading api secrets!');
    console.error(e);
    throw e;
  }
};

// Same rule as Verus Desktop's isAllowedIpcEvent: only messages posted to this window by the
// preload, from the dev server or from the packaged page on Desktop's loopback server.
export const isAllowedIpcEvent = (event: MessageEvent): boolean => {
  if (event == null || typeof event.data !== 'string') return false;
  if (MOCK_IPC) {
    return event.origin === IPC_ORIGIN_DEV || event.origin === IPC_ORIGIN_DEV_LOCALHOST;
  }
  if (typeof window === 'undefined' || event.source !== window) return false;

  if (DEVMODE) {
    return event.origin === IPC_ORIGIN_DEV || event.origin === IPC_ORIGIN_DEV_LOCALHOST;
  }

  const {location} = window;
  const port = Number(location.port);
  return (
    event.origin === location.origin &&
    location.protocol === 'http:' &&
    location.hostname === '127.0.0.1' &&
    Number.isInteger(port) &&
    port > 0 &&
    port <= 65535 &&
    location.pathname === IPC_PACKAGED_ENTRY_PATH
  );
};

export const handleIpc = async (event: MessageEvent): Promise<void> => {
  try {
    if (isAllowedIpcEvent(event)) {
      const data = JSON.parse(event.data) as IpcMessage;

      if (data.type === IPC_INIT_MESSAGE) {
        setupRpcConfig(data as IpcInitMessage);
      } else if (
        data.type === IPC_PUSH_MESSAGE &&
        data.method === IPC_LOGIN_CONSENT_REQUEST_METHOD
      ) {
        setupRpcConfig();
        updateReduxStore(data as IpcPushMessage);
      }
    } else if (typeof event.data === 'string') {
      console.log(`[IPC] recieved event message from unapproved origin (${event.origin}), blocked`);
    }
  } catch (e) {
    console.error(e);
    store.dispatch(setError(new Error((e as Error).message)));
  }
};
