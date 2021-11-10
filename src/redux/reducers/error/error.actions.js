import {
  SET_API_ERROR,
  SET_ERROR
} from "./error.types";

export const setError = (error) => {
  return {
    type: SET_ERROR,
    payload: {
      error
    }
  }
}

export const setApiError = (apiCall, error) => {
  return {
    type: SET_API_ERROR,
    payload: {
      apiCall,
      error
    }
  }
}
