import { API_VERIFY_ID_PROVISIONING_RESPONSE, NATIVE, POST } from "../../utils/constants";
import { getApiData } from "../callCreator";

export const verifyIdProvisioningResponse = async (response) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_VERIFY_ID_PROVISIONING_RESPONSE,
      {
        response,
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