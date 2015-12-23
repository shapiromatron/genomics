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

function deleteFeatureListAction(id){
    return {
        type: types.DELETE_FEATURE_LIST,
        id,
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
                        .then(cb(null));
                } else {
                    response.json()
                        .then((json) => cb(json));
                }
            })
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}


export function deleteFeatureList(id, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchDelete(state.urls.csrf);
        return fetch(`${state.urls.feature_list}${id}/`, opts)
            .then(function(response){
                if (response.status === 204){
                    dispatch(deleteFeatureListAction(id));
                    cb(null);
                } else {
                    response.json()
                        .then((json) => cb(json));
                }
            })
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}


export function postFeatureList(post, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.urls.csrf, post);
        return fetch(state.urls.feature_list, opts)
            .then(function(response){
                if (response.status === 201){
                    response.json()
                        .then((json) => dispatch(receiveFeatureList(json)))
                        .then(cb(null));
                } else {
                    response.json()
                        .then((json) => cb(json));
                }
            })
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}
