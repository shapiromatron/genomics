import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

import config from './config';
import feature_list from './FeatureList';


const reducer = combineReducers({
    router: routerStateReducer,
    config,
    feature_list,
});

export default reducer;
