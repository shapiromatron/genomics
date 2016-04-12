import React from 'react';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { loadConfig } from 'actions/Config';


import ANForm from   'containers/Analysis/Form';

import reducer from 'reducers';
import {
    devMiddleware,
    renderDevTools,
} from 'utils/devTools';


const middleware = [ thunk ];
const store = compose(
    applyMiddleware(...middleware),
    devMiddleware()
)(createStore)(reducer);

class Root extends React.Component {

    componentWillMount() {
        store.dispatch(loadConfig());
    }

    render() {
        return (
            <div>
                <Provider store={store}>
                    <ANForm />
                </Provider>
                {renderDevTools(store)}
            </div>
        );
    }
}

export default <Root />;
