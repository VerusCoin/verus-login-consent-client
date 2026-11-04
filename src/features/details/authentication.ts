import {
  AuthenticationRequestDetails,
  AuthenticationRequestOrdinalVDXFObject,
  AuthenticationResponseDetails,
  AuthenticationResponseOrdinalVDXFObject,
  GenericRequest,
  OrdinalVDXFObject,
} from 'verus-typescript-primitives';

import {detailAdded, selectDetailById} from '#/redux/reducers/genericRequest/authenticationSlice';
import {AppDispatch, RootState} from '#/redux/store';
import {unixToDate} from '#/utils/math';

import {getConstraintLabel, resolveConstraintFriendlyNames} from './constraintUtils';

function getExpiryLabel(authRequestDetail: AuthenticationRequestDetails): string | null {
  if (!authRequestDetail.hasExpiryTime()) return null;
  return unixToDate(authRequestDetail.expiryTime.toNumber());
}

export async function prepareAuthenticationDetail(
  ordinal: OrdinalVDXFObject,
  detailIndex: number,
  dispatch: AppDispatch,
  getState: () => RootState
): Promise<void> {
  if (!(ordinal instanceof AuthenticationRequestOrdinalVDXFObject)) {
    throw new Error('Ordinal is not an AuthenticationRequestOrdinalVDXFObject.');
  }

  const authDetail = ordinal.data;

  if (!authDetail.isValid()) {
    throw new Error('AuthenticationRequestDetails is not valid.');
  }

  const state = getState();

  // Prevent re-running if this detail has already been prepped.
  const existingDetail = selectDetailById(state, detailIndex);
  if (existingDetail) {
    return;
  }

  const chainId = state.chainMetadata.chainId;
  const signerIdentity = state.signatureInfo.signedBy;
  const signingRevocationIdentity = state.signatureInfo.signingRevocationIdentity;
  const signingRecoveryIdentity = state.signatureInfo.signingRecoveryIdentity;

  const constraints = authDetail?.recipientConstraints ?? [];
  const expiryLabel = getExpiryLabel(authDetail);

  let constraintsLabels: string[] = [];

  if (constraints.length > 0) {
    const friendlyNames = await resolveConstraintFriendlyNames(
      chainId,
      constraints,
      signerIdentity,
      signingRevocationIdentity,
      signingRecoveryIdentity
    );
    constraintsLabels = constraints.map(constraint =>
      getConstraintLabel(constraint, friendlyNames)
    );
  }

  dispatch(
    detailAdded({
      index: detailIndex,
      constraintsLabels,
      expiryLabel,
    })
  );
}

export async function generateAuthenticationResponse(
  request: GenericRequest,
  detailIndex: number
): Promise<AuthenticationResponseOrdinalVDXFObject | null> {
  const ordinalWrapper = request.details[detailIndex];

  if (!(ordinalWrapper instanceof AuthenticationRequestOrdinalVDXFObject)) {
    throw new Error('Detail is not an AuthenticationRequestOrdinalVDXFObject.');
  }

  const authRequestDetail = ordinalWrapper.data;

  const authResponseDetail = new AuthenticationResponseOrdinalVDXFObject({
    data: new AuthenticationResponseDetails({
      requestID: authRequestDetail.requestID,
    }),
  });

  return authResponseDetail;
}
