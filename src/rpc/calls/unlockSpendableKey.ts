import {GenericRequest} from 'verus-typescript-primitives';

import {API_UNLOCK_SPENDABLE_KEY, NATIVE, POST} from '../../utils/constants';
import {getApiData} from '../callCreator';

export interface UnlockedSpendableKey {
  address: string;
}

export const unlockSpendableKey = async (
  chainId: string,
  request: GenericRequest,
  detailIndex: number,
  password: string
): Promise<UnlockedSpendableKey> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_UNLOCK_SPENDABLE_KEY,
      {
        chainTicker: chainId,
        request: request.toBuffer().toString('hex'),
        detailIndex,
        password,
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
