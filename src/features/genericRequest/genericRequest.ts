import {
  CREATE_WALLET_BACKUP_DETAILS_VDXF_ORDINAL,
  GenericRequest,
  SPENDABLE_KEY_DETAILS_VDXF_ORDINAL,
  VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL,
} from 'verus-typescript-primitives';
import {VerusIdInterface} from 'verusid-ts-client';

import {RootState} from '#/redux/store';
import {verifyGenericRequest} from '#/rpc/calls/verifyGenericRequest';
import {Identity} from '#/types/identity';

const UNSIGNED_DETAIL_TYPES = [
  VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL,
  SPENDABLE_KEY_DETAILS_VDXF_ORDINAL,
  CREATE_WALLET_BACKUP_DETAILS_VDXF_ORDINAL,
];

/*
 * Checks the validity of a generic request and throws errors for any issues found.
 */
export async function checkGenericRequest(
  chainId: string,
  request: GenericRequest,
  getState: () => RootState,
  provisioningCapability: string | null = null
) {
  if (!request.isValidVersion()) {
    throw new Error(`The request version ${request.version} is unsupported.`);
  }

  if (request.details.length === 0) {
    throw new Error('The request contains no details.');
  }

  if (!VerusIdInterface.validateUnsignedGenericRequest(request)) {
    throw new Error('The detail structure within the request is not valid.');
  }

  if (!request.isSigned()) {
    // Like Verus Mobile, only VerusPay invoices, spendable keys and wallet backups can be unsigned.
    const canBeUnsigned = request.details.every(detail =>
      UNSIGNED_DETAIL_TYPES.some(type => detail.type.eq(type))
    );

    if (!canBeUnsigned) {
      throw new Error('The request is not signed.');
    }

    if (request.hasAppOrDelegatedID()) {
      throw new Error('The request has an app or delegated ID and must be signed.');
    }
  } else {
    // Verify the signature of the generic request.
    const verificationResult = await verifyGenericRequest(chainId, request, provisioningCapability);
    if (!verificationResult.verified) {
      throw new Error(verificationResult.message);
    }

    if (request.hasAppOrDelegatedID()) {
      // Check the signing identity is in the wallet, so that the appOrDelegatedId is allowed
      const signingId = request.signature.identityID.toIAddress();
      const identities = getState().identity.identities as Identity[];
      const found = identities.find(id => {
        return id.identity.identityaddress === signingId;
      });

      if (!found) {
        throw new Error(
          `The signing identity is not in the wallet, so having an app or delegated ID is not allowed.`
        );
      }
    }
  }
}
