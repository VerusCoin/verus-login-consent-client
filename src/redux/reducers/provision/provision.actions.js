import {
  SET_IDENTITY_TO_PROVISION_FIELD,
  SET_PROVISONING_INFO,
  SET_PROVISONING_NAME,
  SET_PROVISONING_RESPONSE,
  SET_REQUESTED_FQN
} from "./provision.types";

export const setIdentityToProvisionField = (idToProvisionField) => {
  return {
    type: SET_IDENTITY_TO_PROVISION_FIELD,
    payload: {
      idToProvisionField
    }
  };
};

export const setProvisioningInfo = (provisioningInfo) => {
  return {
    type: SET_PROVISONING_INFO,
    payload: {
      provisioningInfo
    }
  };
};

export const setProvisioningResponse = (provisioningResponse) => {
  return {
    type: SET_PROVISONING_RESPONSE,
    payload: {
      provisioningResponse
    }
  };
};

export const setRequestedFqn = (requestedFqn) => {
  return {
    type: SET_REQUESTED_FQN,
    payload: {
      requestedFqn
    }
  };
};

export const setProvisioningName= (provisioningName) => {
  return {
    type: SET_PROVISONING_NAME,
    payload: {
      provisioningName
    }
  };
};