import { API_SIGN_ID_PROVISIONING_REQUEST, NATIVE, POST } from "../../utils/constants";
import { getApiData } from "../callCreator";

/**
 * Signs an identity Provisioning request with a given r-address.
 */
export const signIdProvisioningRequest = async (chainId, request, raddress) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_SIGN_ID_PROVISIONING_REQUEST,
      {
        chainTicker: chainId,
        request: request,
        raddress: raddress,
      },
      POST,
      true
    );
    if (res.msg !== "success") throw new Error(res.result);
    else return res.result;
  } catch (e) {
    console.error(e.message);
    throw new Error(e.message);
  }
};