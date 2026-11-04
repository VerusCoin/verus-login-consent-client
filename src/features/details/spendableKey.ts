import {
  SpendableKeyDetails,
  SpendableKeyDetailsOrdinalVDXFObject,
} from 'verus-typescript-primitives';

import {DetailPrepFunction} from './types';

export const SPENDABLE_KEY_MAX_KDF_ITERS = 1000000;

export const spendableKeyRequiresPassword = (details: SpendableKeyDetails): boolean =>
  details.isEncrypted() || details.usesSaltedTaggedAes256Gcm();

export const prepareSpendableKeyDetail: DetailPrepFunction = async ordinal => {
  if (!(ordinal instanceof SpendableKeyDetailsOrdinalVDXFObject)) {
    throw new Error('Ordinal is not a SpendableKeyDetailsOrdinalVDXFObject.');
  }

  const details = ordinal.data;

  if (!details.isValid()) {
    throw new Error('Invalid spendable key details.');
  }

  if (!details.isBIP39()) {
    throw new Error('Only BIP39 spendable key details are supported.');
  }

  if (spendableKeyRequiresPassword(details)) {
    if (!details.usesSaltedTaggedAes256Gcm()) {
      throw new Error('Unsupported seed details encryption format.');
    }

    if (!details.containsKDFIters() || details.KDFIters.lten(0)) {
      throw new Error('Encrypted seed details are missing KDF iteration metadata.');
    }

    if (details.KDFIters.gtn(SPENDABLE_KEY_MAX_KDF_ITERS)) {
      throw new Error(
        `Encrypted seed details exceed the maximum supported KDF iteration count of ${SPENDABLE_KEY_MAX_KDF_ITERS}.`
      );
    }
  } else if (!details.encryptionFormat.eq(SpendableKeyDetails.ENCRYPTION_FORMAT_NONE)) {
    throw new Error('Unsupported seed details encryption format.');
  }
};
