import React from 'react';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { requestContent } from '../actions';
import reducer from '../reducers';
import Form from './Form';


const middleware = [ thunk ];
const store = compose(
    applyMiddleware(...middleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)(reducer);

class Root extends React.Component {

    componentWillMount() {
        store.dispatch(requestContent(this.props.config));
    }

    render() {
        return (
            <Provider store={store}>
                <Form genome_assembly_selector={this.props.config.genome_assembly_selector} />
            </Provider>
        );
    }
}

export default Root;
