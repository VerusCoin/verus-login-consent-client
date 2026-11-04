import {
  GenericRequest,
  getDataKey,
  IdentityUpdateRequestDetails,
  IdentityUpdateRequestOrdinalVDXFObject,
  IdentityUpdateResponseDetails,
  IdentityUpdateResponseOrdinalVDXFObject,
  toIAddress,
} from 'verus-typescript-primitives';

import {setDefinedDataKeys} from '#/redux/reducers/genericRequest/definedDataKeysSlice';
import {setActiveVerusId} from '#/redux/reducers/identity/identity.actions';
import {AppDispatch, RootState} from '#/redux/store';
import {executeIdentityUpdateRequest} from '#/rpc/calls/executeIdentityUpdateRequest';
import {Identity} from '#/types/identity';
import {capitalizeString} from '#/utils/stringUtils';
import {getKnownVDXFKeyName} from '#/utils/vdxfTypeLabels';

export async function prepareIdentityUpdateDetail(
  ordinal: IdentityUpdateRequestOrdinalVDXFObject,
  _detailIndex: number,
  dispatch: AppDispatch,
  getState: () => RootState
): Promise<void> {
  if (!(ordinal instanceof IdentityUpdateRequestOrdinalVDXFObject)) {
    throw new Error('Ordinal is not an IdentityUpdateRequestOrdinalVDXFObject.');
  }

  const detail = ordinal.data;

  if (!detail.identity) {
    throw new Error('Invalid identity update detail: missing identity.');
  }

  const state = getState();
  const identities = state.identity.identities as Identity[];
  const detailIdentityName = detail.identity.name;

  const matchingIdentity = identities.find(id => id.identity.name === detailIdentityName);

  if (!matchingIdentity) {
    throw new Error(`No identity found for "${detailIdentityName}" in the available identities.`);
  }

  validateAndAddCmmKeys(detail, dispatch, getState);

  // We need an active identity to sign the response with.
  // If there is no authentication detail to set the active identity, then use the
  // identity being updated.
  if (!state.identity.activeIdentity) {
    dispatch(setActiveVerusId(matchingIdentity));
  }
}

function validateAndAddCmmKeys(
  detail: IdentityUpdateRequestDetails,
  dispatch: AppDispatch,
  getState: () => RootState
) {
  const state = getState();
  const request = state.deeplink.data;

  if (!(request instanceof GenericRequest)) {
    return;
  }

  const cmmKeys = detail.getContentMultiMapKeys();
  // Only signed requests are allowed for ID updates.
  const reqSigner = request.signature.identityID.toAddress();

  const rootSystem = request.isTestnet() ? 'VRSCTEST' : 'VRSC';

  let updated = false;
  const updatedKeys = {...(state.genericRequest.definedDataKeys.keys ?? {})};

  for (const key of cmmKeys) {
    if (key.includes('::')) {
      const fqnSplit = key.split('::');
      const fqnNamespace = toIAddress(fqnSplit[0], rootSystem);
      const dataKey = getDataKey(key, fqnNamespace, toIAddress(rootSystem)).id;
      const knownVDXFKey = getKnownVDXFKeyName(dataKey);

      if (knownVDXFKey != null) {
        continue;
      }

      if (fqnNamespace !== reqSigner) {
        throw new Error(
          `Cannot update with key not in signer namespace (key namespace is ${fqnSplit[0]}@)`
        );
      }

      updatedKeys[dataKey] = {
        vdxfuri: key,
        nsid: fqnNamespace,
        label: capitalizeString(fqnSplit[1].split('.').join(' ')),
      };
      updated = true;
    } else {
      const knownKeyName = getKnownVDXFKeyName(key);

      if (!knownKeyName) {
        throw new Error(`Cannot update with unknown key ${key}`);
      }
    }
  }

  if (updated) {
    dispatch(setDefinedDataKeys(updatedKeys));
  }
}

export async function generateIdentityUpdateResponse(
  request: GenericRequest,
  detailIndex: number,
  getState: () => RootState
) {
  const ordinalWrapper = request.details[detailIndex];
  const state = getState();
  const chainId = state.chainMetadata.chainId;

  if (!(ordinalWrapper instanceof IdentityUpdateRequestOrdinalVDXFObject)) {
    throw new Error('Detail is not an IdentityUpdateRequestOrdinalVDXFObject');
  }

  const detail = ordinalWrapper.data;

  // This will throw an error on failure.
  const txid = await executeIdentityUpdateRequest(chainId, detail);

  const responseDetail = new IdentityUpdateResponseDetails({
    txid: Buffer.from(txid, 'hex').reverse(),
    requestID: detail.requestID,
  });

  const responseOrdinal = new IdentityUpdateResponseOrdinalVDXFObject({
    data: responseDetail,
  });

  return responseOrdinal;
}
