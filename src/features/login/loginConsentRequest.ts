import {LoginConsentRequest} from 'verus-typescript-primitives';

import {verifyLoginRequest} from '#/rpc/calls/verifyRequest';
import {SUPPORTED_CREDENTIALS, SUPPORTED_SCOPES} from '#/utils/constants';

// Checks a login consent request for validity and throws errors for any issues found
export const checkLoginConsentRequest = async (
  chainId: string,
  request: LoginConsentRequest,
  provisioningCapability: string | null = null
) => {
  const verificationCheck = await verifyLoginRequest(chainId, request, provisioningCapability);
  if (!verificationCheck.verified) {
    throw new Error(verificationCheck.message);
  }

  if (request.challenge.context != null) {
    if (Object.keys(request.challenge.context.kv).length !== 0) {
      throw new Error('Login requests with context are currently unsupported.');
    }
  }

  for (const requestedPermission of request.challenge.requested_access) {
    if (
      !SUPPORTED_SCOPES.includes(requestedPermission.vdxfkey) &&
      !SUPPORTED_CREDENTIALS.includes(requestedPermission.vdxfkey)
    ) {
      throw new Error('Unrecognized requested permission ' + requestedPermission.vdxfkey);
    }
  }

  if (request.challenge.requested_access.length == 0) {
    throw new Error('No permissions being requested in loginconsent request.');
  }
};
