import * as types from '../constants/ActionTypes';
import h from '../utils/helpers';


function requestContent() {
    return {
        type: types.FEATURE_LIST.REQUEST,
    };
}

function receiveObjects(json) {
    return {
        type: types.FEATURE_LIST.RECEIVE_OBJECTS,
        items: json,
    };
}

function receiveObject(item){
    return {
        type: types.FEATURE_LIST.RECIEVE_OBJECT,
        item,
    };
}

function removeObject(id){
    return {
        type: types.FEATURE_LIST.DELETE_OBJECT,
        id,
    };
}

function fetchObject(id){
    return (dispatch, getState) => {
        let state = getState();
        if (state.feature_list.isFetching) return;
        dispatch(requestContent());
        return fetch(`${state.config.feature_list}${id}/`, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveObject(json)))
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}

export function fetchObjectsIfNeeded() {
    return (dispatch, getState) => {
        let state = getState();
        if (state.feature_list.isFetching) return;
        dispatch(requestContent());
        return fetch(state.config.feature_list, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveObjects(json)))
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}

export function patchObject(id, patch, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.config.csrf, patch, 'PATCH');
        return fetch(`${state.config.feature_list}${id}/`, opts)
            .then(function(response){
                if (response.status === 200){
                    response.json()
                        .then((json) => dispatch(fetchObject(json.id)))
                        .then(cb(null));
                } else {
                    response.json()
                        .then((json) => cb(json));
                }
            })
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}

export function postObject(post, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.config.csrf, post);
        return fetch(state.config.feature_list, opts)
            .then(function(response){
                if (response.status === 201){
                    response.json()
                        .then((json) => dispatch(receiveObject(json)))
                        .then(cb(null));
                } else {
                    response.json()
                        .then((json) => cb(json));
                }
            })
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}

export function deleteObject(id, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchDelete(state.config.csrf);
        return fetch(`${state.config.feature_list}${id}/`, opts)
            .then(function(response){
                if (response.status === 204){
                    dispatch(removeObject(id));
                    cb(null);
                } else {
                    response.json()
                        .then((json) => cb(json));
                }
            })
            .catch((ex) => console.error('Feature-list parsing failed', ex));
    };
}
