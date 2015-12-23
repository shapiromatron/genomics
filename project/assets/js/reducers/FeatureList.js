import _ from 'underscore';
import * as types from '../constants/ActionTypes';


let defaultState = {
    isFetching: false,
    items: [],
    // dirtyObject: {},
    // dirtyObjectValidiation: {},
};


export default function (state=defaultState, action) {
    let index, items;
    switch (action.type) {

    case types.FEATURE_LIST.REQUEST:
        return Object.assign({}, state, {
            isFetching: true,
        });

    case types.FEATURE_LIST.RECEIVE_OBJECTS:
        return Object.assign({}, state, {
            items: action.items,
            isFetching: false,
        });

    case types.FEATURE_LIST.RECIEVE_OBJECT:
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

    case types.FEATURE_LIST.DELETE_OBJECT:
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

    default:
        return state;
    }
}
