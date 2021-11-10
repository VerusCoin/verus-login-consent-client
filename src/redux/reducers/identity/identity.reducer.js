/*
  This reducer contains the information about user identities and the 
  chain that they reside on
*/
import {
  SET_ACTIVE_IDENTITY,
  SET_IDENTITIES,
  SET_CHAIN_INFO
} from "./identity.types";

export const identity = (state = {
  activeIdentity: null,
  identities: [],
  chainInfo: null
}, action) => {
  switch (action.type) {
    case SET_ACTIVE_IDENTITY:
      return {
        ...state,
        activeIdentity: action.payload.id
      }
    case SET_IDENTITIES:
      return {
        ...state,
        identities: action.payload.identities
      }
    case SET_CHAIN_INFO:
      return {
        ...state,
        chainInfo: action.payload.info
      }
    default:
      return state;
  }
}