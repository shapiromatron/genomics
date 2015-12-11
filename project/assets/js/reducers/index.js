import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

import urls from './urls';
import feature_list from './FeatureList';


const reducer = combineReducers({
    router: routerStateReducer,
    urls,
    feature_list,
});

export default reducer;
