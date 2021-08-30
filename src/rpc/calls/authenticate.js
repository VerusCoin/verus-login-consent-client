import { API_AUTHENTICATE, ELECTRUM, ETH, POST, ERC20 } from "../../utils/constants";
import { getApiData } from "../callCreator";

/**
 * Authenticates a seed for eth and electrum modes. Returns true on success, throws
 * error on failiure
 * @param {String} seed Seed to authenticate with
 */
export const authenticateSeed = async (seed) => {
  try {
    const electrumAuthResult = await getApiData(ELECTRUM, API_AUTHENTICATE, { seed }, POST, true);
    const ethAuthResult = await getApiData(ETH, API_AUTHENTICATE, { seed }, POST, true);
    const erc20AuthResult = await getApiData(ERC20, API_AUTHENTICATE, { seed }, POST, true);

    if (electrumAuthResult.msg === "error") throw new Error("Electrum authentication failed.");
    else if (ethAuthResult.msg === "error") throw new Error("ETH authentication failed.");
    else if (erc20AuthResult.msg === "error") throw new Error("ERC20 authentication failed.");

    return true;
  } catch (e) {
    console.error(e.message);
    throw e;
  }
};
