import { API_SIGN_LOGIN_REQUEST, NATIVE, POST } from "../../utils/constants"
import { getApiData } from "../callCreator"

export const signRequest = async (chainId, challenge, userId, signature, request) => {
  try {
    const res = await getApiData(NATIVE, API_SIGN_LOGIN_REQUEST, {
      chain: chainId,
      challenge,
      signature,
      request,
      user_id: userId
    }, POST, true);
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}