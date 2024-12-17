import { API_GET_VDXF_ID, NATIVE, POST } from "../../utils/constants";
import { getApiData } from "../callCreator";

/**
 * Runs getVdxfId with a given vdxfuri and optional vdxf data.
 */
export const getVdxfId = async (chainId, vdxfuri, initialvdxfdata) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_GET_VDXF_ID,
      {
        chainTicker: chainId,
        vdxfuri: vdxfuri,
        initialvdxfdata: initialvdxfdata,
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