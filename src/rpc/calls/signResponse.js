import { API_SIGN_LOGIN_RESPONSE, NATIVE, POST } from "../../utils/constants"
import { getApiData } from "../callCreator"

export const signResponse = async (response) => {
  try {
    const res = await getApiData(NATIVE, API_SIGN_LOGIN_RESPONSE, {
      response
    }, POST, true);
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}