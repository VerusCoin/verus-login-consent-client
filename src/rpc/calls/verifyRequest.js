import { API_VERIFY_LOGIN_REQUEST, NATIVE, POST } from "../../utils/constants";
import { getApiData } from "../callCreator";

export const verifyLoginRequest = async (chainId, request, capability = null) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_VERIFY_LOGIN_REQUEST,
      {
        chainTicker: chainId,
        request: request,
        capability,
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