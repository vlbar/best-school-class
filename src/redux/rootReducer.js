import { combineReducers } from 'redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './auth/authReducer';
import stateReduser from './state/stateReduser';
import userReducer from './user/userReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    state: stateReduser,
    user: userReducer
})

export const store = createStore(rootReducer, applyMiddleware(thunk)); 