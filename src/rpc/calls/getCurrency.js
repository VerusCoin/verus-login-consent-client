import { API_GET_CURRENCY, NATIVE, POST } from "../../utils/constants"
import { getApiData } from "../callCreator"

/**
 * Runs getCurrency with a given chain name.
 */
export const getCurrency = async (chainId, chainName) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_GET_CURRENCY,
      {
        chainTicker: chainId,
        name: chainName,
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