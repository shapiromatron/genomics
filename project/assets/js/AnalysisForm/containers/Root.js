import React from 'react';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { requestContent } from '../actions';
import reducer from '../reducers';
import Form from './Form';

import $ from 'jquery';


const middleware = [ thunk ];
const store = compose(
    applyMiddleware(...middleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)(reducer);

class Root extends React.Component {

    getInitialValues() {
        let ds,
            obj = {
                userDatasetsSelected: [],
                encodeSelected: [],
            };
        try{
            ds = JSON.parse($(this.props.config.datasets_json_selector).val());
        } catch (e) {
            ds = {};
        }

        if (ds.userDatasets){
            obj.userDatasetsSelected = ds.userDatasets;
        }
        if (ds.encodeDatasets){
            obj.encodeSelected = ds.encodeDatasets;
        }

        return obj;
    }

    componentWillMount() {
        let initial = this.getInitialValues();
        store.dispatch(requestContent(this.props.config, initial.userDatasetsSelected, initial.encodeSelected));
    }

    render() {
        return (
            <Provider store={store}>
                <Form
                    genome_assembly_selector={this.props.config.genome_assembly_selector}
                    datasets_json_selector={this.props.config.datasets_json_selector}
                />
            </Provider>
        );
    }
}

export default Root;
