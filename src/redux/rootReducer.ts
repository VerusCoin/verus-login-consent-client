import {combineReducers} from '@reduxjs/toolkit';

import {chainMetadata} from './reducers/chainMetadata/chainMetadata.reducer';
import {credentials} from './reducers/credentials/credentials.reducer';
import {deeplink} from './reducers/deeplink/deeplinkSlice';
import {error} from './reducers/error/error.reducer';
import genericRequestReducer from './reducers/genericRequest';
import {genericResponse} from './reducers/genericResponse/genericResponseSlice';
import {identity} from './reducers/identity/identity.reducer';
import {navigation} from './reducers/navigation/navigationSlice';
import {origin} from './reducers/origin/origin.reducer';
import {provision} from './reducers/provision/provisionSlice';
import {rpc} from './reducers/rpc/rpcSlice';
import {signatureInfo} from './reducers/signatureInfo/signatureInfoSlice';

const rootReducer = combineReducers({
  navigation,
  rpc,
  identity,
  origin,
  error,
  provision,
  credentials,
  signatureInfo,
  chainMetadata,
  deeplink,
  genericResponse,
  genericRequest: genericRequestReducer,
});

export default rootReducer;
