import * as types from '../constants/ActionTypes';


export default function (state = {}, action) {
    switch (action.type) {
    case types.LOAD_URLS:
        let data = JSON.parse(document.getElementById('config').textContent);
        data.csrf= data.csrf.match(/value='([\w]+)'/)[1];
        return data;
    default:
        return state;
    }
}
