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
    default:
        return state;
    }
}
