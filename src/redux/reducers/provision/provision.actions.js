import {
  SET_IDENTITY_TO_PROVISION_FIELD,
  SET_PROVISONING_INFO
} from "./provision.types"

export const setIdentityToProvisionField = (idToProvisionField) => {
  return {
    type: SET_IDENTITY_TO_PROVISION_FIELD,
    payload: {
      idToProvisionField
    }
  }
}

export const setProvisioningInfo= (provisioningInfo) => {
  return {
    type: SET_PROVISONING_INFO,
    payload: {
      provisioningInfo
    }
  }
}