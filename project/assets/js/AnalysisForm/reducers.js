import * as types from './constants';

let defaultState = {
    startupContentReceived: false,
    userDatasets: null,
    encodeDatasetsAvailable: null,
    encodeOptions: null,
};


export default function (state=defaultState, action) {
    switch (action.type) {

    case types.AN_RECEIVE_CONTENT:
        return Object.assign({}, state, {
            startupContentReceived: true,
            userDatasets: action.userDatasets,
            encodeDatasetsAvailable: action.encodeDatasetsAvailable,
            encodeOptions: action.encodeOptions,
        });

    default:
        return state;
    }
}
