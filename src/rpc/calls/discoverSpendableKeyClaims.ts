import {API_DISCOVER_SPENDABLE_KEY_CLAIMS, NATIVE, POST} from '../../utils/constants';
import {getApiData} from '../callCreator';

export interface SpendableKeyCurrency {
  currencyId: string;
  name: string;
  amount: string;
}

export interface SpendableKeyIdentity {
  identityAddress: string;
  fullyQualifiedName?: string;
  unsupportedReason: string | null;
}

export interface SpendableKeyClaims {
  currencies: SpendableKeyCurrency[];
  identities: SpendableKeyIdentity[];
}

export const discoverSpendableKeyClaims = async (
  chainId: string,
  address: string
): Promise<SpendableKeyClaims> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_DISCOVER_SPENDABLE_KEY_CLAIMS,
      {
        chainTicker: chainId,
        address,
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
