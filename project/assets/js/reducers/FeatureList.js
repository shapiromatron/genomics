import _ from 'underscore';
import * as types from '../constants/ActionTypes';


export default function (state = {
    isFetching: false,
    didInvalidate: false,
    items: [],
}, action) {
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
        const index = state.items.indexOf(
            _.findWhere(state.items, {id: action.item.id})
        );
        let items = [
            ...state.items.slice(0, index),
            action.item,
            ...state.items.slice(index),
        ];
        return Object.assign({}, state, {
            isFetching: false,
            items,
        });
    default:
        return state;
    }
}
