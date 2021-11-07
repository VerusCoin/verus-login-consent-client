import {
  IPC_LOGIN_CONSENT_REQUEST_METHOD,
  IPC_INIT_MESSAGE,
  IPC_ORIGIN_DEV,
  IPC_PUSH_MESSAGE,
} from "../utils/constants";

export const SIMULATED_IPC_INIT = {
  origin: IPC_ORIGIN_DEV,
  data: JSON.stringify({
    type: IPC_INIT_MESSAGE,
    data: {
      expiry_margin: 60000,
      rpc_port: 17775,
      post_encryption: true,
      window_id: 1
    }
  })
}

export const SIMULATED_IPC_COIN_REQUEST = {
  origin: IPC_ORIGIN_DEV,
  data: JSON.stringify({
    type: IPC_PUSH_MESSAGE,
    method: IPC_LOGIN_CONSENT_REQUEST_METHOD,
    data: {
      ticker: "ETH",
      mode: "eth",
      origin_app_info: {
        id: "VERUS_DESKTOP_MAIN",
        search_builtin: true
      },
      launch_config: {}
    }
  })
}

export const RPC_PASSWORD = "a35792af94edd32da7e8f35b1c38c337555482c0542e88d83b00d348289e33a1"