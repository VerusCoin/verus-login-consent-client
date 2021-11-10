import { API_VERIFY_LOGIN_REQUEST, NATIVE, POST } from "../../utils/constants"
import { apiPost, getApiData } from "../callCreator"

export const verifyRequest = async (chainId, challenge, sourceId, signature) => {
  try {
    const res = await getApiData(NATIVE, API_VERIFY_LOGIN_REQUEST, {
      chain: chainId,
      challenge,
      source_id: sourceId,
      signature,
    }, POST, true);
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}