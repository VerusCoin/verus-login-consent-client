import {
  DataDescriptor,
  DataPacketRequestOrdinalVDXFObject,
  DataResponseDetails,
  DataResponseOrdinalVDXFObject,
  GenericRequest,
  SignatureData,
  SignatureDataKey,
  VdxfUniValue,
} from 'verus-typescript-primitives';

import {RootState} from '#/redux/store';
import {signData, SignDataParams} from '#/rpc/calls/signData';
import {Identity} from '#/types/identity';

import {DetailPrepFunction} from './types';

export const prepareDataPacketDetail: DetailPrepFunction = async ordinal => {
  if (!(ordinal instanceof DataPacketRequestOrdinalVDXFObject)) {
    throw new Error('Ordinal is not a DataPacketRequestOrdinalVDXFObject.');
  }

  const dataPacketDetail = ordinal.data;

  if (!dataPacketDetail.isValid()) {
    throw new Error('DataPacketRequestDetails is not valid.');
  }
};

export async function generateDataPacketResponse(
  request: GenericRequest,
  detailIndex: number,
  getState: () => RootState
): Promise<DataResponseOrdinalVDXFObject | null> {
  const ordinalWrapper = request.details[detailIndex];

  if (!(ordinalWrapper instanceof DataPacketRequestOrdinalVDXFObject)) {
    throw new Error('Ordinal is not a DataPacketRequestOrdinalVDXFObject.');
  }

  const state = getState();
  const chainId = state.chainMetadata.chainId;
  const signingIdentity = state.identity.activeIdentity as Identity;

  const dataPacketDetail = ordinalWrapper.data;

  // Create signatures for each data descriptor and store them in a single VdxfUniValue.
  const values = [];

  for (const signableObject of dataPacketDetail.signableObjects) {
    const signParams: SignDataParams = {
      address: signingIdentity.identity.identityaddress,
    };
    if (typeof signableObject === 'string') {
      signParams.message = signableObject;
    } else {
      signParams.messagehex = signableObject.objectdata.toString('hex');
    }
    try {
      const signatureResult = await signData(chainId, signParams);

      const signatureData = SignatureData.fromJson(signatureResult.signaturedata);

      values.push({[SignatureDataKey.vdxfid]: signatureData});
    } catch (error) {
      console.error('Error signing data:', error);
      throw error;
    }
  }

  const vdxfUniValue = new VdxfUniValue({
    values,
  });

  const dataDescriptor = new DataDescriptor({
    version: DataDescriptor.DEFAULT_VERSION,
    objectdata: vdxfUniValue.toBuffer(),
  });

  const dataPacketResponse = new DataResponseOrdinalVDXFObject({
    data: new DataResponseDetails({
      requestID: dataPacketDetail.requestID,
      data: dataDescriptor,
    }),
  });

  return dataPacketResponse;
}
