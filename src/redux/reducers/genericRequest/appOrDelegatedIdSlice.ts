import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {Identity} from '#/types/identity';

export interface AppOrDelegatedIdState {
  identity: Identity | null;
}

const initialState: AppOrDelegatedIdState = {
  identity: null,
};

const appOrDelegatedIdSlice = createSlice({
  name: 'appOrDelegatedId',
  initialState,
  reducers: {
    setAppOrDelegatedId: (_state, action: PayloadAction<Identity>) => ({
      identity : action.payload,
    }),
    clearAppOrDelegatedId: state => {
      state.identity = null;
    },
  },
});

export const {setAppOrDelegatedId, clearAppOrDelegatedId} = appOrDelegatedIdSlice.actions;
export default appOrDelegatedIdSlice.reducer;
