/*
  This reducer contains the information about users
*/
import { API_GET_CHAIN_INFO, API_GET_IDENTITIES } from "../../../utils/constants";
import { SET_CHAIN_INFO, SET_IDENTITIES } from "../identity/identity.types";
import {
  SET_ERROR,
  SET_API_ERROR
} from "./error.types";

export const error = (state = {
  error: null,
  apiErrors: {
    [API_GET_IDENTITIES]: null,
    [API_GET_CHAIN_INFO]: null
  }
}, action) => {
  switch (action.type) {
    case SET_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case SET_API_ERROR:
      return {
        ...state,
        apiErrors: {
          ...state.apiErrors,
          [action.payload.apiCall]: action.payload.error
        }
      }
    case SET_IDENTITIES:
      return {
        ...state,
        apiErrors: {
          ...state.apiErrors,
          [API_GET_IDENTITIES]: null
        }
      }
    case SET_CHAIN_INFO:
      return {
        ...state,
        apiErrors: {
          ...state.apiErrors,
          [API_GET_CHAIN_INFO]: null
        }
      }
    default:
      return state;
  }
}