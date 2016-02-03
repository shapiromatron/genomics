import _ from 'underscore';

import * as types from 'constants/ActionTypes';
import h from 'utils/helpers';


let defaultState = {
    itemsLoaded: false,
    isFetching: false,
    items: [],
    editObject: null,
    editObjectErrors: null,
    isFetchingEncode: false,
    encodeOptions: null,
    encodeDatasetsAvailable: [],
};


export default function (state=defaultState, action) {
    let index, items;
    switch (action.type) {

    case types.AN_REQUEST:
        return Object.assign({}, state, {
            isFetching: true,
        });

    case types.AN_REQUEST_ENCODE:
        return Object.assign({}, state, {
            isFetchingEncode: true,
        });

    case types.AN_RECEIVE_OBJECTS:
        return Object.assign({}, state, {
            items: action.items,
            isFetching: false,
            itemsLoaded: true,
        });

    case types.AN_RECIEVE_OBJECT:
        index = state.items.indexOf(
            _.findWhere(state.items, {id: action.item.id})
        );
        if (index>=0){
            items = [
                ...state.items.slice(0, index),
                action.item,
                ...state.items.slice(index+1),
            ];
        } else {
            items = [
                ...state.items,
                action.item,
            ];
        }
        return Object.assign({}, state, {
            isFetching: false,
            items,
        });

    case types.AN_DELETE_OBJECT:
        index = state.items.indexOf(
            _.findWhere(state.items, {id: action.id})
        );
        if (index>=0){
            items = [
                ...state.items.slice(0, index),
                ...state.items.slice(index+1),
            ];
        }

        return Object.assign({}, state, {
            isFetching: false,
            items,
        });

    case types.AN_RESET_EDIT_OBJECT:
        return Object.assign({}, state, {
            editObject: null,
            editObjectErrors: {},
        });

    case types.AN_CREATE_EDIT_OBJECT:
        return Object.assign({}, state, {
            editObject: action.object,
            editObjectErrors: {},
        });

    case types.AN_RECEIVE_EDIT_ERRORS:
        return Object.assign({}, state, {
            editObjectErrors: action.errors,
        });

    case types.AN_CHANGE_EDIT_OBJECT:
        let editObject = h.deepCopy(state.editObject);
        editObject[action.key] = action.value;
        return Object.assign({}, state, {editObject});

    case types.AN_RECIEVE_ENCODE_OPTIONS:
        return Object.assign({}, state, {
            encodeOptions: action.json,
            isFetchingEncode: false,
        });

    case types.AN_RECIEVE_ENCODE_DATASETS:
        return Object.assign({}, state, {
            encodeDatasetsAvailable: _.indexBy(action.json, 'id'),
        });

    default:
        return state;
    }
}
