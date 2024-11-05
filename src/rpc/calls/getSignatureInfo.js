import { API_GET_SIGNATURE_INFO, LITE, POST } from "../../utils/constants"
import { getApiData } from "../callCreator"

/**
 * Gets information about a signature signed with a given i-address.
 */
export const getSignatureInfo = async (chainId, systemId, signature, address) => {
  try {
    const res = await getApiData(
      LITE,
      API_GET_SIGNATURE_INFO,
      {
        chainTicker: chainId,
        systemId: systemId,
        signature: signature,
        iaddress: address
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
}