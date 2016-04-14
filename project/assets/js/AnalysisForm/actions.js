import $ from 'jquery';
import _ from 'underscore';

import * as types from './constants';
import h from 'utils/helpers';


// ---- Initial startup actions
export function requestContent(config){
    return (dispatch, getState) => {
        let userDatasets = $.get(config.user_dataset),
            encodeOpts = $.get(config.encode_dataset_options);

        $.when(userDatasets, encodeOpts)
            .done(function(userDatasets, encodeOpts){
                dispatch(receiveContent(config, userDatasets[0], encodeOpts[0]));
            });
    };
}

function receiveContent(config, userDatasets, encodeOptions){
    return {
        type: types.STARTUP,
        userDatasets: _.indexBy(userDatasets, 'id'),
        config,
        encodeOptions,
    };
}


// ---- Genomic assembly changes
export function genomeAssemblyChange(value){
    return {
        type: types.GENOME_CHANGE,
        value: value,
    };
}


// ---- Request new encode options
export function requestEncodeDatasets(query){
    return (dispatch, getState) => {
        let state = getState(),
            opts = $.param(query, false),
            url = `${state.config.encode_dataset}?${opts}`;
        return fetch(url, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveEncodeDatasets(json.results)))
            .catch((ex) => console.error('Encode dataset parsing failed', ex));
    };
}
function receiveEncodeDatasets(json){
    return {
        type: types.RECIEVE_ENCODE,
        encodeDatasetsAvailable: _.indexBy(json, 'id'),
    };
}


// ---- Change user-selected ENCODE to include
export function changeSelectedEncode(encodeSelected){
    return {
        type: types.SELECTED_ENCODE,
        encodeSelected,
    };
}


// ---- Change user-selected user-datasets to include
export function changeSelectedUserDatasets(userDatasetsSelected){
    return {
        type: types.SELECTED_USER_DATASETS,
        userDatasetsSelected,
    };
}
