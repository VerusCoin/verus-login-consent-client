import { combineReducers } from 'redux';
import { navigation } from './reducers/navigation/navigation.reducer';
import { rpc } from './reducers/rpc/rpc.reducer';
import { identity } from './reducers/identity/identity.reducer';
import { origin } from './reducers/origin/origin.reducer';
import { error } from './reducers/error/error.reducer';
import { provision } from './reducers/provision/provision.reducer';

const rootReducer = combineReducers({
    navigation,
    rpc,
    identity,
    origin,
    error,
    provision
});

export default rootReducer;