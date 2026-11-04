import {
  OrdinalVDXFObject,
  ProvisionIdentityDetailsOrdinalVDXFObject,
} from 'verus-typescript-primitives';

export async function prepareProvisionIdentityDetail(ordinal: OrdinalVDXFObject): Promise<void> {
  if (!(ordinal instanceof ProvisionIdentityDetailsOrdinalVDXFObject)) {
    throw new Error('Ordinal is not an ProvisionIdentityDetailsOrdinalVDXFObject.');
  }

  const detail = ordinal.data;

  if (!detail.isValid()) {
    throw new Error('ProvisionIdentityDetails is not valid.');
  }
}
