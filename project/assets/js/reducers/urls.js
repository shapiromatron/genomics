import * as types from '../constants/ActionTypes';


export default function (state = {}, action) {
    switch (action.type) {
    case types.LOAD_URLS:
        return JSON.parse(document.getElementById('config').textContent);
    default:
        return state;
    }
}
