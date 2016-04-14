import * as types from './constants';

let defaultState = {
    config: null,
    startupContentReceived: false,
    genome_assembly: null,
    userDatasets: null,
    userDatasetsSelected: [],
    encodeDatasetsAvailable: {},
    encodeOptions: null,
    encodeSelected: [],
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

    case types.AN_SELECTED_USER_DATASETS:
        return Object.assign({}, state, {
            userDatasetsSelected: action.userDatasetsSelected,
        });

    default:
        return state;
    }
}
