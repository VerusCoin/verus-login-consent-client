import { API_GET_IDENTITIES, API_SAVE_USERS } from "../../utils/constants"
import { apiGet, apiPost } from "../callCreator"

/**
 * Runs listidentities to get a list of the user's VerusIDs
 */
export const loadIdentities = async (chainId) => {
  try {
    const nativeIdentities = await apiPost(`native/${API_GET_IDENTITIES}`, { chainTicker: chainId, includeCanSign: true })
    if (nativeIdentities.msg !== 'success') throw new Error(nativeIdentities.result)
    else return nativeIdentities.result.filter(id => id.cansignfor)
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}