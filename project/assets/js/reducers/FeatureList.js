import _ from 'underscore';
import * as types from '../constants/ActionTypes';


export default function (state = {
    isFetching: false,
    didInvalidate: false,
    items: [],
}, action) {
    let index, items;
    switch (action.type) {

    case types.REQUEST_FEATURE_LISTS:
        return Object.assign({}, state, {
            isFetching: true,
        });

    case types.RECEIVE_FEATURE_LISTS:
        return Object.assign({}, state, {
            items: action.items,
            isFetching: false,
        });

    case types.RECEIVE_FEATURE_LIST:
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

    case types.DELETE_FEATURE_LIST:
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
