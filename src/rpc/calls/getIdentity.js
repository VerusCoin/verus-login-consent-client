import { API_GET_IDENTITY, NATIVE, POST } from "../../utils/constants"
import { getApiData } from "../callCreator"

/**
 * Runs getIdentity with a given i-address.
 */
export const getIdentity = async (chainId, id) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_GET_IDENTITY,
      {
        chainTicker: chainId,
        name: id,
      },
      POST,
      true
    );
    if (res.msg !== "success") throw new Error(res.result);
    else return res.result;
  } catch (e) {
    // Don't console log the error since the error can be used to determine if 
    // an identity already exists when provisioning.
    throw new Error(e.message);
  }
}