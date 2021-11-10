import { API_GET_CHAIN_INFO } from "../../utils/constants"
import { apiPost } from "../callCreator"

export const getChainInfo = async (chainId) => {
  try {
    const info = await apiPost(`native/${API_GET_CHAIN_INFO}`, { chainTicker: chainId })
    if (info.msg !== 'success') throw new Error(info.result)
    else return info.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}