import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BlockInfo} from 'verus-typescript-primitives/dist/block/BlockInfo';

import {Identity} from '#/types/identity';

export interface SignatureInfoState {
  signedBy: Identity | null;
  sigBlockInfo: BlockInfo | null;
  signingRevocationIdentity: Identity | null;
  signingRecoveryIdentity: Identity | null;
}

const initialState: SignatureInfoState = {
  signedBy: null,
  sigBlockInfo: null,
  signingRevocationIdentity: null,
  signingRecoveryIdentity: null,
};

const signatureInfoSlice = createSlice({
  name: 'signatureInfo',
  initialState,
  reducers: {
    setSignatureInfo: (
      state,
      action: PayloadAction<{
        signedBy?: Identity;
        sigBlockInfo?: BlockInfo;
        signingRevocationIdentity?: Identity;
        signingRecoveryIdentity?: Identity;
      }>
    ) : SignatureInfoState => {
      const current = state as unknown as SignatureInfoState;
      const {signedBy, sigBlockInfo, signingRevocationIdentity, signingRecoveryIdentity} =
        action.payload;

      return {
        signedBy: signedBy ?? current.signedBy,
        sigBlockInfo: sigBlockInfo ?? current.sigBlockInfo,
        signingRevocationIdentity: signingRevocationIdentity ?? current.signingRevocationIdentity,
        signingRecoveryIdentity: signingRecoveryIdentity ?? current.signingRecoveryIdentity,
      };
    },
  },
});

export const {setSignatureInfo} = signatureInfoSlice.actions;
export const signatureInfo = signatureInfoSlice.reducer;
