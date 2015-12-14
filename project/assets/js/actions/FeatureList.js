import _ from 'underscore';
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

function receiveFeatureList(item){
    return {
        type: types.RECEIVE_FEATURE_LIST,
        item,
    };
}

export function fetchFeatureListsIfNeeded() {
    return (dispatch, getState) => {
        let state = getState();
        if (state.feature_list.isFetching) return;
        dispatch(requestFeatureLists());
        return fetch(state.urls.feature_list, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveFeatureLists(json)))
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}


export function loadLatestFeatureList(id){
    return (dispatch, getState) => {
        let state = getState();
        if (state.feature_list.isFetching) return;
        dispatch(requestFeatureLists());
        return fetch(`${state.urls.feature_list}${id}/`, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveFeatureList(json)))
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}


export function patchFeatureList(id, patch, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.urls.csrf, patch, 'PATCH');
        return fetch(`${state.urls.feature_list}${id}/`, opts)
            .then(function(response){
                if (response.status === 200){
                    response.json()
                        .then((json) => dispatch(loadLatestFeatureList(json.id)))
                        .then(cb);
                } else {
                    console.log('failed');
                }
            })
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}


export function createFeatureList(id, content){
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.urls.csrf, content);
        return fetch(`${state.urls.feature_list}${id}/`, opts)
            .then(function(response){
                if (response.status === 200){
                    response.json().then((json) => dispatch(loadLatestFeatureList(json.id)))
                } else {
                    console.log('failed');
                }
            })
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}
