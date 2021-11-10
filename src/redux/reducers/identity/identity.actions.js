import { getChainInfo } from "../../../rpc/calls/chainInfo";
import { loadIdentities } from "../../../rpc/calls/identities";
import { API_GET_CHAIN_INFO, API_GET_IDENTITIES } from "../../../utils/constants";
import { setApiError } from "../error/error.actions";
import {
  SET_IDENTITIES,
  SET_ACTIVE_IDENTITY,
  SET_CHAIN_INFO
} from "./identity.types";

export const setIdentities = (identities) => {
  return {
    type: SET_IDENTITIES,
    payload: {
      identities
    }
  }
}

export const setActiveVerusId = (id) => {
  return {
    type: SET_ACTIVE_IDENTITY,
    payload: {
      id
    }
  }
}

export const setChainInfo = (info) => {
  return {
    type: SET_CHAIN_INFO,
    payload: {
      info
    }
  }
}

/**
 * Attempts to get the list of usable identities
 */
export const checkAndUpdateIdentities = async (chain) => {
  try {
    const identities = await loadIdentities(chain)
    
    return [setIdentities(identities)]
  } catch (e) {
    console.error(e.message)
    return [setApiError(API_GET_IDENTITIES, e)]
  }
}

export const checkAndUpdateChainInfo = async (chain) => {
  try {
    const info = await getChainInfo(chain)
    
    return [setChainInfo(info)]
  } catch (e) {
    console.error(e.message)
    return [setApiError(API_GET_CHAIN_INFO, e)]
  }
}

export const checkAndUpdateAll = async (chain) => {
  return [...(await checkAndUpdateIdentities(chain)), ...(await checkAndUpdateChainInfo(chain))];
}