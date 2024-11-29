import { API_GET_ADDRESSES, NATIVE, POST } from "../../utils/constants"
import { getApiData } from "../callCreator"

/**
 * Gets addresses of the current wallet with the options to include private addresses
 * and/or include private balances.
 */
export const getAddresses = async (chainId, includePrivateAddresses, includePrivateBalances) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_GET_ADDRESSES,
      {
        chainTicker: chainId,
        includePrivateAddresses: includePrivateAddresses,
        includePrivateBalances, includePrivateBalances
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