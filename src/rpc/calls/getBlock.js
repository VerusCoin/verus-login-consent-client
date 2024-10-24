import { API_GET_BLOCK, NATIVE, POST } from "../../utils/constants"
import { getApiData } from "../callCreator"

/**
 * Runs getBlock with a given block hash or height and verbosity.
 */
export const getBlock = async (chainId, hashorheight, verbosity) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_GET_BLOCK,
      {
        chainTicker: chainId,
        hashorheight: hashorheight,
        verbosity: verbosity,
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