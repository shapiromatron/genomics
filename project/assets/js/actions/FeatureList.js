import * as types from '../constants/ActionTypes';
import h from '../utils/helpers';


function requestFeatureLists() {
    return {
        type: types.REQUEST_FEATURE_LISTS,
    };
}


function receiveFeatureLists(json) {
    return {
        type: types.RECEIVE_FEATURE_LISTS,
        items: json,
    };
}


export function fetchFeatureListsIfNeeded() {
    return (dispatch, getState) => {
        let state = getState();
        if (state.feature_list.isFetching) return;
        dispatch(requestFeatureLists());
        return fetch(state.urls.feature_list, h.fetchOpts)
            .then(response => response.json())
            .then(json => dispatch(receiveFeatureLists(json)))
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}
