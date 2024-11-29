/*
  This reducer contains the information about provisioning.
*/
import {
  SET_IDENTITY_TO_PROVISION_FIELD,
  SET_PROVISONING_INFO
} from "./provision.types";

export const provision = (state = {
  identityToProvisionField: "",
  provisioningInfo: {},
}, action) => {
  switch (action.type) {
    case SET_IDENTITY_TO_PROVISION_FIELD:
      return {
        ...state,
        identityToProvisionField: action.payload.idToProvisionField
      }
    case SET_PROVISONING_INFO:
      return {
        ...state,
        provisioningInfo: action.payload.provisioningInfo
      }
    default:
      return state;
  }
}