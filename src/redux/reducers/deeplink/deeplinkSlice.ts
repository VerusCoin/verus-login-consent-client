/*
  This reducer contains the deeplink information, including the
  type of deeplink (id) and the data associated with it.
*/
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GenericRequest, LoginConsentRequest, VerusPayInvoice} from 'verus-typescript-primitives';

export type DeeplinkData = LoginConsentRequest | VerusPayInvoice | GenericRequest;

export interface DeeplinkState {
  id: string;
  data: DeeplinkData | null;
  // Verus Desktop's ticket for provisioning an identity from this request, or null.
  provisioningCapability: string | null;
}

const initialState: DeeplinkState = {
  id: '',
  data: null,
  provisioningCapability: null,
};

const deeplinkSlice = createSlice({
  name: 'deeplink',
  initialState,
  reducers: {
    setDeeplinkData: (
      state,
      action: PayloadAction<{
        id: string;
        data: DeeplinkData;
        provisioningCapability?: string | null;
      }>
    ) => {
      state.id = action.payload.id;
      state.data = action.payload.data;
      state.provisioningCapability = action.payload.provisioningCapability ?? null;
    },
  },
});

export const {setDeeplinkData} = deeplinkSlice.actions;
export const deeplink = deeplinkSlice.reducer;
