import { combineReducers } from 'redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './auth/authReducer';

const rootReducer = combineReducers({
    auth: authReducer
})

export const store = createStore(rootReducer, applyMiddleware(thunk)); 