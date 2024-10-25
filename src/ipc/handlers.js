import { DEVMODE, MOCK_IPC } from "../env"
import { RPC_PASSWORD, RPC_PORT } from "../__tests__/mocks"
import { setRpcLoginConsentRequest, setRpcExpiryMargin, setRpcPassword, setRpcPort, setRpcPostEncryption, setRpcWindowId } from "../redux/reducers/rpc/rpc.actions"
import store from "../redux/store"
import { IPC_LOGIN_CONSENT_REQUEST_METHOD, IPC_INIT_MESSAGE, IPC_ORIGIN_DEV, IPC_ORIGIN_PRODUCTION, IPC_PUSH_MESSAGE } from "../utils/constants"
import { setOriginAppId, setOriginAppBuiltin } from "../redux/reducers/origin/origin.actions"
import { setError } from "../redux/reducers/error/error.actions"

export const handleIpc = async (event) => {
  try {
    if (
      typeof event.data === "string" &&
      ((!DEVMODE && event.origin === IPC_ORIGIN_PRODUCTION) ||
        (DEVMODE && event.origin === IPC_ORIGIN_DEV))
    ) {
      const data = JSON.parse(event.data);

      if (data.type === IPC_INIT_MESSAGE) {
        store.dispatch(setRpcExpiryMargin(data.data.expiry_margin));
        store.dispatch(setRpcPort(data.data.rpc_port));
        store.dispatch(setRpcPostEncryption(data.data.post_encryption));
        store.dispatch(setRpcWindowId(data.data.window_id));

        try {
          if (MOCK_IPC) store.dispatch(setRpcPassword(RPC_PASSWORD));
          else store.dispatch(setRpcPassword(window.bridge.getSecretSync().BuiltinSecret));
        } catch (e) {
          console.error("Error loading api secrets!");
          console.error(e);
          throw e;
        }
      } else if (
        data.type === IPC_PUSH_MESSAGE &&
        data.method === IPC_LOGIN_CONSENT_REQUEST_METHOD
      ) {
        try {
          if (MOCK_IPC) {
            store.dispatch(setRpcExpiryMargin(60000));
            store.dispatch(setRpcPort(RPC_PORT));
            store.dispatch(setRpcPostEncryption(true));
            store.dispatch(setRpcWindowId(1));
            store.dispatch(setRpcPassword(RPC_PASSWORD));
          }
          else store.dispatch(setRpcPassword(window.bridge.getSecretSync().BuiltinSecret));
        } catch (e) {
          console.error("Error loading api secrets!");
          console.error(e);
          throw e;
        }

        // Translate the system id into a chain name for displaying and use in api requests.
        let chain_id

        switch (data.data.request.system_id) {
          case "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV":
            chain_id = "VRSC";
            break;
          case "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq":
            chain_id = "VRSCTEST";
            break;
          default:
            throw new Error("Unknown system id.")
        }

        data.data.request.chain_id = chain_id

        store.dispatch(
          setRpcLoginConsentRequest({
            request: data.data.request,
          })
        );
        store.dispatch(setOriginAppBuiltin(data.data.origin_app_info.search_builtin));
        store.dispatch(setOriginAppId(data.data.origin_app_info.id));
      }
    } else if (typeof event.data === "string") {
      console.log(`[IPC] recieved event message from unapproved origin (${event.origin}), blocked`);
    }
  } catch(e) {
    console.error(e)
    store.dispatch(setError(new Error(e.message)));
  }
}