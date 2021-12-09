import { API_VERIFY_LOGIN_REQUEST, NATIVE, POST } from "../../utils/constants"
import { getApiData } from "../callCreator"

export const verifyRequest = async (request) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_VERIFY_LOGIN_REQUEST,
      {
        request,
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