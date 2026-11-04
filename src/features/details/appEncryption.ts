import {
  AppEncryptionRequestDetails,
  AppEncryptionRequestOrdinalVDXFObject,
  AppEncryptionResponseDetails,
  AppEncryptionResponseOrdinalVDXFObject,
  DataDescriptor,
  DataResponseDetails,
  DataResponseOrdinalVDXFObject,
  GenericRequest,
  OrdinalVDXFObject,
} from 'verus-typescript-primitives';

import {RootState} from '#/redux/store';
import {encryptAppEncryptionResponse} from '#/rpc/calls/encryptAppEncryptionResponse';
import {executeAppEncryptionRequest} from '#/rpc/calls/executeAppEncryptionRequest';
import {Identity} from '#/types/identity';

export async function prepareAppEncryptionDetail(ordinal: OrdinalVDXFObject): Promise<void> {
  if (!(ordinal instanceof AppEncryptionRequestOrdinalVDXFObject)) {
    throw new Error('Ordinal is not an AppEncryptionRequestOrdinalVDXFObject.');
  }

  const detail: AppEncryptionRequestDetails = ordinal.data;

  if (!detail.isValid()) {
    throw new Error('Invalid app encryption request detail.');
  }
}

export async function generateAppEncryptionResponse(
  request: GenericRequest,
  detailIndex: number,
  getState: () => RootState
): Promise<DataResponseOrdinalVDXFObject | AppEncryptionResponseOrdinalVDXFObject> {
  const ordinalWrapper = request.details[detailIndex];

  if (!(ordinalWrapper instanceof AppEncryptionRequestOrdinalVDXFObject)) {
    throw new Error('Detail is not an AppEncryptionRequestOrdinalVDXFObject.');
  }

  const requestDetail: AppEncryptionRequestDetails = ordinalWrapper.data;

  const state = getState();
  const chainId = state.chainMetadata.chainId;
  const signingIdentity = state.signatureInfo.signedBy;

  const activeIdentity = state.identity.activeIdentity as Identity | null;
  if (!activeIdentity) {
    throw new Error('No active identity available for app encryption.');
  }

  const fromID = activeIdentity.identity.identityaddress;

  let toID: string;

  if (request.appOrDelegatedID) {
    toID = request.appOrDelegatedID.toIAddress();
  } else {
    toID = signingIdentity.identity.identityaddress;
  }

  const appEncryptionResult = await executeAppEncryptionRequest(
    chainId,
    requestDetail,
    fromID,
    toID
  );

  // Use fromJson since we can use the string forms of the keys that we get from the main app.
  const responseData = AppEncryptionResponseDetails.fromJson({
    version: 1,
    incomingviewingkey: appEncryptionResult.incomingViewingKey,
    extendedviewingkey: appEncryptionResult.extendedViewingKey,
    address: appEncryptionResult.address,
    extendedspendingkey: appEncryptionResult.extendedSpendingKey,
  });

  // toJson doesn't work with the CompactIAddressObject, so just add it in after we
  // create the response data.
  if (requestDetail.requestID) {
    responseData.requestID = requestDetail.requestID;
    responseData.toggleContainsRequestID();
  }

  if (requestDetail.hasEncryptResponseToAddress()) {
    // Store the AppEncryptionResponse detail within the DataPacketResponse so that
    // the keys can be encrypted for secure transit.
    const encryptedDataDescriptorJson = await encryptAppEncryptionResponse(
      chainId,
      responseData,
      fromID,
      requestDetail.encryptResponseToAddress.toAddressString()
    );

    const encryptedDataDescriptor = DataDescriptor.fromJson(encryptedDataDescriptorJson);

    const encryptedResponseDetail = new DataResponseDetails({
      requestID: requestDetail.requestID,
      data: encryptedDataDescriptor,
    });

    return new DataResponseOrdinalVDXFObject({
      data: encryptedResponseDetail,
    });
  }

  return new AppEncryptionResponseOrdinalVDXFObject({
    data: responseData,
  });
}
