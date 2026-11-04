import {LoginConsentProvisioningResponseInterface} from 'verus-typescript-primitives';

import {
  API_GET_ID_PROVISIONING_STATUS,
  API_SUBMIT_ID_PROVISIONING_REQUEST,
  NATIVE,
  POST,
} from '../../utils/constants';
import {getApiData} from '../callCreator';

// The consent window can't reach the provisioning service itself. Verus Desktop sends the
// signed request to the webhook named in the original request, for this capability only.
export const submitIdProvisioningRequest = async (
  capability: string,
  request: unknown
): Promise<LoginConsentProvisioningResponseInterface> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_SUBMIT_ID_PROVISIONING_REQUEST,
      {
        capability,
        request,
      },
      POST,
      true
    );
    if (res.msg !== 'success') throw new Error(res.result);
    else return res.result;
  } catch (e) {
    console.error(e.message);
    throw new Error(e.message);
  }
};

// Verus Desktop only reads a status URI the provisioning service returned for this capability.
export const getIdProvisioningStatus = async (
  capability: string,
  uri: string
): Promise<LoginConsentProvisioningResponseInterface> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_GET_ID_PROVISIONING_STATUS,
      {
        capability,
        uri,
      },
      POST,
      true
    );
    if (res.msg !== 'success') throw new Error(res.result);
    else return res.result;
  } catch (e) {
    console.error(e.message);
    throw new Error(e.message);
  }
};
