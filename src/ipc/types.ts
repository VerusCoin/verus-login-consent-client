import {IPC_INIT_MESSAGE, IPC_PUSH_MESSAGE} from '#/utils/constants';

declare global {
  interface Window {
    bridge: {
      getSecretSync: () => {
        BuiltinSecret: string;
      };
    };
  }
}

export interface DeeplinkPayload {
  id: string;
  data: object;
}

export interface OriginAppInfo {
  main_chain_ticker: string;
  search_builtin: boolean;
  id: string;
}

export interface IpcInitData {
  expiry_margin: number;
  rpc_port: number;
  post_encryption: boolean;
  window_id: number;
}

export interface IpcPushData {
  origin_app_info: OriginAppInfo;
  deeplink: DeeplinkPayload;
  // Verus Desktop's one-time ticket, only for a request that asks to provision an identity.
  provisioning_capability?: string | null;
}

export interface IpcInitMessage {
  type: typeof IPC_INIT_MESSAGE;
  data: IpcInitData;
}

export interface IpcPushMessage {
  type: typeof IPC_PUSH_MESSAGE;
  method: string;
  data: IpcPushData;
}

export type IpcMessage = IpcInitMessage | IpcPushMessage;
