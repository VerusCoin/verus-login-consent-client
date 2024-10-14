import { LoginConsentRequest } from "verus-typescript-primitives";
import {
  IPC_LOGIN_CONSENT_REQUEST_METHOD,
  IPC_INIT_MESSAGE,
  IPC_ORIGIN_DEV,
  IPC_PUSH_MESSAGE,
} from "../utils/constants";
import base64url from "base64url";

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


const req = new LoginConsentRequest();
// VRSC deeplink.
const value = "Aa4uvSgsLAWiinJ7Go12_G6zOcUB_TwBGvW4AVxk05q0TGDq2DF_n1qbbEywlZtATU9tgPUm2l0a7Sybm5W4LN3vHSRMeg9ysAUJ8BfPPdpjudQGAUkCBdNxMQABQR9V21X8oiI9U-4fYzas6n203JnoB-woHrjt6I18v_q-9VnalJ8i50jzA8VFBJCqqI4EYZIKWhSEYPQHBKGzKTpHGSnAPo-o1JwfjbV2JpOK-1fENZwBnxScadzcsjPtACKau-L3aiqQgZSISJe2-WYAAAAAAAAUy9qxMOboVB1n5pq7TC7U5vm_gkgBuonE5ahwRyi4Yzpj4r2yofpHq64BAAAAAAAAAf1cwLohmEeSbIZXeiNWWAKnYOcZASFodHRwczovL3ZlcnVzLmlvL2FwaS9hdXRoL3dlYmhvb2tWe5qHsXEx9u6y3QvdGR7OSl1gOwEBAA";
// Testnet deeplink.
// const value = "Aa4uvSgsLAWiinJ7Go12_G6zOcUB_SUBpu-eojVjXjKBJP80KdufnpG2Ti3u1m-zsh-isY5kO9G2fWKtgWgVod3vHSRMeg9ysAUJ8BfPPdpjudQGAUkCBQ20AwABQR-nXPGHPnf-1GJ3o58bWSk6EFJUEiN5MK1t8Cp06CzzVTibtozB2Ce0HTYjv2VOHOKTn8bJt0SYVq5114lSCxeZGSnAPo-o1JwfjbV2JpOK-1fENZwBiBTUY-p2HA3X1kP09WJjGNjJTvBXAQNiAGcAAAAAAAAAAbqJxOWocEcouGM6Y-K9sqH6R6uuAQAAAAAAAAFuVZUYA3ymyUd68h7Mlr3cYcLSpgEeaHR0cDovLzEyNy4wLjAuMS9jb25maXJtLWxvZ2luVnuah7FxMfbust0L3RkezkpdYDsBAQA"
req.fromBuffer(base64url.toBuffer(value));

export const SIMULATED_IPC_LOGIN_CONSENT_REQUEST = {
  origin: IPC_ORIGIN_DEV,
  data: JSON.stringify({
    type: IPC_PUSH_MESSAGE,
    method: IPC_LOGIN_CONSENT_REQUEST_METHOD,
    data: {
      request: req,
      origin_app_info: {
        id: "VERUS_DESKTOP_MAIN",
        search_builtin: true
      },
    }
  })
}

export const RPC_PASSWORD = "a35792af94edd32da7e8f35b1c38c337555482c0542e88d83b00d348289e33a1"
export const RPC_PORT = "17776"