import * as types from './constants';

let defaultState = {
    config: null,
    startupContentReceived: false,
    userDatasets: null,
    encodeDatasetsAvailable: {},
    encodeOptions: null,
    encodeSelected: [],
    genome_assembly: null,
};


export default function (state=defaultState, action) {
    switch (action.type) {

    case types.AN_STARTUP:
        return Object.assign({}, state, {
            startupContentReceived: true,
            userDatasets: action.userDatasets,
            encodeOptions: action.encodeOptions,
            config: action.config,
        });

    case types.AN_GENOME_CHANGE:
        return Object.assign({}, state, {
            genome_assembly: action.value,
            encodeDatasetsAvailable: {},
        });

    case types.AN_RECIEVE_ENCODE:
        return Object.assign({}, state, {
            encodeDatasetsAvailable: action.encodeDatasetsAvailable,
        });

    case types.AN_SELECTED_ENCODE:
        return Object.assign({}, state, {
            encodeSelected: action.encodeSelected,
        });

    default:
        return state;
    }
}
