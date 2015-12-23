import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

import config from './config';
import feature_list from './FeatureList';
import user_dataset from './UserDataset';


const reducer = combineReducers({
    router: routerStateReducer,
    config,
    feature_list,
    user_dataset,
});

export default reducer;
