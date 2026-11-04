import {
  GenericRequest,
  ID_ADDRESS_VDXF_KEY,
  ID_FULLYQUALIFIEDNAME_VDXF_KEY,
  ID_PARENT_VDXF_KEY,
  ID_SYSTEMID_VDXF_KEY,
  LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY,
  LoginConsentRequest,
  ProvisionIdentityDetailsOrdinalVDXFObject,
} from 'verus-typescript-primitives';

export interface ProvisioningInfoItem {
  vdxfkey: string;
  data: string;
}

export interface ProvisionIdentityData {
  address: ProvisioningInfoItem | null;
  systemId: ProvisioningInfoItem | null;
  fqn: ProvisioningInfoItem | null;
  parent: ProvisioningInfoItem | null;
  webhook: ProvisioningInfoItem | null;
}

export interface ProvisioningRequestContext {
  challengeId: string;
  signerId: string;
  systemId: string;
}

export function extractProvisionIdentityDataV1(
  loginRequest: LoginConsentRequest
): ProvisionIdentityData {
  const findProvisioningInfo = (key: {vdxfid: string}): ProvisioningInfoItem | undefined => {
    return loginRequest.challenge.provisioning_info.find(
      (x: ProvisioningInfoItem) => x.vdxfkey === key.vdxfid
    );
  };

  const address = findProvisioningInfo(ID_ADDRESS_VDXF_KEY) ?? null;
  const systemId = findProvisioningInfo(ID_SYSTEMID_VDXF_KEY) ?? null;
  const fqn = findProvisioningInfo(ID_FULLYQUALIFIEDNAME_VDXF_KEY) ?? null;
  const parent = findProvisioningInfo(ID_PARENT_VDXF_KEY) ?? null;
  const webhook = findProvisioningInfo(LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY) ?? null;

  return {
    address,
    systemId,
    fqn,
    parent,
    webhook,
  };
}

export function extractProvisionIdentityDataV2(
  request: GenericRequest,
  currentDetailIndex: number
): ProvisionIdentityData {
  const ordinalWrapper = request.details[currentDetailIndex];

  if (!(ordinalWrapper instanceof ProvisionIdentityDetailsOrdinalVDXFObject)) {
    throw new Error('Ordinal is not an ProvisionIdentityDetailsOrdinalVDXFObject.');
  }

  const provisionIdentityDetails = ordinalWrapper.data;

  const address: ProvisioningInfoItem | null = provisionIdentityDetails.identityID
    ? {vdxfkey: ID_ADDRESS_VDXF_KEY.vdxfid, data: provisionIdentityDetails.identityID.toAddress()}
    : null;

  const systemId: ProvisioningInfoItem | null = provisionIdentityDetails.systemID
    ? {vdxfkey: ID_SYSTEMID_VDXF_KEY.vdxfid, data: provisionIdentityDetails.systemID.toAddress()}
    : null;

  const parent: ProvisioningInfoItem | null = provisionIdentityDetails.parentID
    ? {vdxfkey: ID_PARENT_VDXF_KEY.vdxfid, data: provisionIdentityDetails.parentID.toAddress()}
    : null;

  const webhook: ProvisioningInfoItem | null = provisionIdentityDetails.uri
    ? {
        vdxfkey: LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY.vdxfid,
        data: provisionIdentityDetails.uri.getUriString(),
      }
    : null;

  return {
    address,
    systemId,
    fqn: null,
    parent,
    webhook,
  };
}
/*
 * extractProvisioningRequestContextV1 gets the request ID, signer and system from a LoginConsentRequest.
 */
export function extractProvisioningRequestContextV1(
  loginRequest: LoginConsentRequest
): ProvisioningRequestContext {
  return {
    challengeId: loginRequest.challenge.challenge_id,
    signerId: loginRequest.signing_id,
    systemId: loginRequest.system_id,
  };
}

/*
 * extractGenericProvisioningRequestContext gets the request ID, signer and system from a GenericRequest.
 */

export function extractGenericProvisioningRequestContext(
  request: GenericRequest
): ProvisioningRequestContext {
  if (!request.hasRequestID() || !request.requestID) {
    throw new Error('Provisioning request is missing a request ID.');
  }

  if (!request.isSigned() || !request.signature) {
    throw new Error('Provisioning request must be signed.');
  }

  return {
    challengeId: request.requestID.toAddress(),
    signerId: request.signature.identityID.toIAddress(),
    systemId: request.signature.systemID.toIAddress(),
  };
}
