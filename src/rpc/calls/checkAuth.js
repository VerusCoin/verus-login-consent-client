import { API_CHECK_AUTH } from "../../utils/constants"
import { getApiData } from "../callCreator"

/**
 * Checks if a coin is authenticated
 * @param {String} chain Coin to check
 */
export const checkAuthentication = async (mode) => {
  try {
    return await getApiData(mode, API_CHECK_AUTH)
  } catch (e) {
    console.error(e.message)
    throw e
  }
}