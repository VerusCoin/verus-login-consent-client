/*
  This reducer contains the information about provisioning.
*/
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {LoginConsentProvisioningResponseInterface} from 'verus-typescript-primitives';

interface ProvisioningInfoItem {
  vdxfkey: string;
  data: string;
}

export interface ProvisioningInfo {
  provAddress: ProvisioningInfoItem | null;
  provSystemId: ProvisioningInfoItem | null;
  provFqn: ProvisioningInfoItem | null;
  provParent: ProvisioningInfoItem | null;
  provWebhook: ProvisioningInfoItem | null;
  friendlyNameMap: Record<string, string>;
}

export interface ProvisionState {
  identityToProvisionField: string;
  primaryAddress: string;
  provisioningInfo: ProvisioningInfo | null;
  provisioningResponse: LoginConsentProvisioningResponseInterface | null;
  requestedFqn: string;
  requestedId: string;
  provisioningName: string;
}

const initialState: ProvisionState = {
  identityToProvisionField: '',
  primaryAddress: '',
  provisioningInfo: null,
  provisioningResponse: null,
  requestedFqn: '',
  requestedId: '',
  provisioningName: '',
};

const provisionSlice = createSlice({
  name: 'provision',
  initialState,
  reducers: {
    setIdentityToProvisionField: (state, action: PayloadAction<string>) => {
      state.identityToProvisionField = action.payload;
    },
    setPrimaryAddress: (state, action: PayloadAction<string>) => {
      state.primaryAddress = action.payload;
    },
    setProvisioningInfo: (state, action: PayloadAction<ProvisioningInfo>) => {
      state.provisioningInfo = action.payload;
    },
    setProvisioningResponse: (
      state,
      action: PayloadAction<LoginConsentProvisioningResponseInterface>
    ) => {
      state.provisioningResponse = action.payload;
    },
    setRequestedFqn: (state, action: PayloadAction<string>) => {
      state.requestedFqn = action.payload;
    },
    setRequestedId: (state, action: PayloadAction<string>) => {
      state.requestedId = action.payload;
    },
    setProvisioningName: (state, action: PayloadAction<string>) => {
      state.provisioningName = action.payload;
    },
  },
});

export const {
  setIdentityToProvisionField,
  setPrimaryAddress,
  setProvisioningInfo,
  setProvisioningResponse,
  setRequestedFqn,
  setRequestedId,
  setProvisioningName,
} = provisionSlice.actions;
export const provision = provisionSlice.reducer;
