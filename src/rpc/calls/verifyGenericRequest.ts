import {GenericRequest} from 'verus-typescript-primitives';

import {API_VERIFY_GENERIC_REQUEST, NATIVE, POST} from '../../utils/constants';
import {getApiData} from '../callCreator';

export const verifyGenericRequest = async (
  chainId: string,
  request: GenericRequest,
  capability: string | null = null
) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_VERIFY_GENERIC_REQUEST,
      {
        chainTicker: chainId,
        request: request.toBuffer().toString('hex'),
        capability,
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
