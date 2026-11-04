import {
  AuthenticationRequestOrdinalVDXFObject,
  GenericRequest,
  ID_ADDRESS_VDXF_KEY,
  LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY,
  LoginConsentRequest,
  ProvisionIdentityDetailsOrdinalVDXFObject,
  RecipientConstraint,
} from 'verus-typescript-primitives';

import {Identity} from '#/types/identity';
import {SUPPORTED_CREDENTIALS} from '#/utils/constants';

// The data for displaying the identity selection UI for login.
export interface LoginData {
  requestedDataKeys?: string[];
  hasRequestedCredentials?: boolean;
  canProvision: boolean;
  identitySubjects?: string[];
  filterIdentities: (identities: Identity[]) => Identity[];
  provisioningDetailIndex?: number;
}

/*
 * extractLoginDataV1 gets the data from the LoginConsentRequest.
 */
export const extractLoginDataV1 = (
  request: LoginConsentRequest,
  identities: Identity[]
): LoginData => {
  const requestedDataKeys: string[] = (request.challenge.requested_access || [])
    .filter((item: {vdxfkey: string}) => SUPPORTED_CREDENTIALS.includes(item.vdxfkey))
    .map((item: {vdxfkey: string}) => item.vdxfkey);

  const hasRequestedCredentials: boolean = requestedDataKeys.length > 0;

  let canProvision: boolean =
    !!request.challenge.provisioning_info &&
    request.challenge.provisioning_info.some((x: {vdxfkey: string}) => {
      return x.vdxfkey === LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY.vdxfid;
    });

  const identitySubjects: string[] = (request.challenge.subject || [])
    .filter((item: {vdxfkey: string}) => item.vdxfkey === ID_ADDRESS_VDXF_KEY.vdxfid)
    .map((id: {data: string}) => id.data);

  const identitySubjectMatches = identities.filter((id: Identity) =>
    identitySubjects.includes(id.identity.identityaddress)
  );

  if (identitySubjectMatches.length > 0) {
    canProvision = false;
  }

  const filterIdentities = (identitiesToFilter: Identity[]): Identity[] => {
    if (identitySubjectMatches.length > 0) {
      return identitySubjectMatches;
    }
    return identitiesToFilter;
  };

  return {
    requestedDataKeys,
    hasRequestedCredentials,
    canProvision,
    identitySubjects,
    filterIdentities,
  };
};

const getAllowedSystems = (recipientConstraints: RecipientConstraint[]) => {
  return recipientConstraints.reduce((acc, constraint) => {
    if (constraint.type === RecipientConstraint.REQUIRED_SYSTEM) {
      try {
        acc.add(constraint.identity.toIAddress());
      } catch {
        // Skip invalid systems
      }
    }
    return acc;
  }, new Set<string>());
};

const getRequiredIDs = (recipientConstraints: RecipientConstraint[]) => {
  return recipientConstraints.reduce((acc, constraint) => {
    if (constraint.type === RecipientConstraint.REQUIRED_ID) {
      try {
        acc.add(constraint.identity.toIAddress());
      } catch {
        // Skip invalid IDs
      }
    }
    return acc;
  }, new Set<string>());
};

/*
 * extractLoginDataV2 gets the data from the authentication request detail in a generic request.
 */
export const extractLoginDataV2 = (
  request: GenericRequest,
  currentDetailIndex: number
): LoginData => {
  const ordinalWrapper = request.details[currentDetailIndex];

  if (!(ordinalWrapper instanceof AuthenticationRequestOrdinalVDXFObject)) {
    throw new Error('Detail is not an AuthenticationRequestOrdinalVDXFObject');
  }

  const authRequestDetail = ordinalWrapper.data;

  const recipientConstraints = authRequestDetail?.recipientConstraints ?? [];
  const allowedSystems = getAllowedSystems(recipientConstraints);
  const requiredIDs = getRequiredIDs(recipientConstraints);

  let canProvision = false;
  let provisioningDetailIndex: number;

  if (requiredIDs.size <= 0) {
    provisioningDetailIndex = request.details.findIndex(ordinal => {
      return ordinal instanceof ProvisionIdentityDetailsOrdinalVDXFObject;
    });
    canProvision = provisioningDetailIndex !== -1;
  }

  const filterIdentities = (identitiesToFilter: Identity[]): Identity[] => {
    if (requiredIDs.size === 0 && allowedSystems.size === 0) {
      return identitiesToFilter;
    }

    return identitiesToFilter.filter(identity => {
      const iAddr = identity.identity.identityaddress;
      const chainId = identity.identity.systemid;

      if (requiredIDs.size > 0 && !requiredIDs.has(iAddr)) {
        return false;
      }

      if (allowedSystems.size > 0 && !allowedSystems.has(chainId)) {
        return false;
      }

      return true;
    });
  };

  return {
    canProvision,
    filterIdentities,
    provisioningDetailIndex,
  };
};
