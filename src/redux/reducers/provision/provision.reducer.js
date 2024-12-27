/*
  This reducer contains the information about provisioning.
*/
import {
  SET_IDENTITY_TO_PROVISION_FIELD,
  SET_PRIMARY_ADDRESS,
  SET_PROVISONING_INFO,
  SET_PROVISONING_NAME,
  SET_PROVISONING_RESPONSE,
  SET_REQUESTED_FQN,
  SET_REQUESTED_ID
} from "./provision.types";

export const provision = (state = {
  identityToProvisionField: '',
  primaryAddress: '',
  provisioningInfo: {},
  provisioningResponse: {},
  requestedFqn: '',
  requestedId: '',
  provisioningName: '',
}, action) => {
  switch (action.type) {
  case SET_IDENTITY_TO_PROVISION_FIELD:
    return {
      ...state,
      identityToProvisionField: action.payload.idToProvisionField
    };
  case SET_PRIMARY_ADDRESS:
    return {
      ...state,
      primaryAddress: action.payload.primaryAddress
    };
  case SET_PROVISONING_INFO:
    return {
      ...state,
      provisioningInfo: action.payload.provisioningInfo
    };
  case SET_PROVISONING_RESPONSE:
    return {
      ...state,
      provisioningResponse: action.payload.provisioningResponse
    };
  case SET_REQUESTED_FQN:
    return {
      ...state,
      requestedFqn: action.payload.requestedFqn
    };
  case SET_REQUESTED_ID:
    return {
      ...state,
      requestedId: action.payload.requestedId
    };
  case SET_PROVISONING_NAME:
    return {
      ...state,
      provisioningName: action.payload.provisioningName
    };
  default:
    return state;
  }
};