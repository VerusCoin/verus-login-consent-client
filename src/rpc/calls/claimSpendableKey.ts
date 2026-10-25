import {GenericRequest} from 'verus-typescript-primitives';

import {API_CLAIM_SPENDABLE_KEY, NATIVE, POST} from '../../utils/constants';
import {getApiData} from '../callCreator';

export interface SpendableKeyClaimResult {
  type: 'identity' | 'sweep';
  txid: string;
  includesSweep: boolean;
  identity: {identityAddress: string; fullyQualifiedName?: string} | null;
}

export interface SpendableKeyClaimResults {
  results: SpendableKeyClaimResult[];
  partialError?: string;
}

// privateAddress: a z-address sets it on claimed IDs, null removes theirs, undefined keeps it.
export const claimSpendableKey = async (
  chainId: string,
  request: GenericRequest,
  detailIndex: number,
  password: string,
  destinationAddress: string,
  privateAddress?: string | null
): Promise<SpendableKeyClaimResults> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_CLAIM_SPENDABLE_KEY,
      {
        chainTicker: chainId,
        request: request.toBuffer().toString('hex'),
        detailIndex,
        password,
        destinationAddress,
        privateAddress,
      },
      POST,
      true
    );
    if (res.msg !== 'success') throw new Error(res.result);
    else return res.result;
  } catch (e) {
    console.error(e.message);
    throw new Error(e.message);
  }
};
