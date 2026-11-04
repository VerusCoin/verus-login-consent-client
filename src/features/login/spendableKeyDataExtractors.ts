import {GenericRequest, SpendableKeyDetailsOrdinalVDXFObject} from 'verus-typescript-primitives';

import {spendableKeyRequiresPassword} from '#/features/details/spendableKey';

export interface SpendableKeyData {
  requiresPassword: boolean;
}

export function extractSpendableKeyData(
  request: GenericRequest,
  currentDetailIndex: number
): SpendableKeyData {
  const ordinalWrapper = request.details[currentDetailIndex];

  if (!(ordinalWrapper instanceof SpendableKeyDetailsOrdinalVDXFObject)) {
    throw new Error('Ordinal is not a SpendableKeyDetailsOrdinalVDXFObject.');
  }

  return {
    requiresPassword: spendableKeyRequiresPassword(ordinalWrapper.data),
  };
}
