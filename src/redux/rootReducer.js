import { combineReducers } from 'redux';
import { navigation } from './reducers/navigation/navigation.reducer';
import { rpc } from './reducers/rpc/rpc.reducer';
import { identity } from './reducers/identity/identity.reducer';
import { origin } from './reducers/origin/origin.reducer';
import { error } from './reducers/error/error.reducer';

const rootReducer = combineReducers({
    navigation,
    rpc,
    identity,
    origin,
    error
});

export default rootReducer;