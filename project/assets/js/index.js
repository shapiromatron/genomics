import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore, compose } from 'redux';

import { ReduxRouter, reduxReactRouter } from 'redux-router';

import { Route } from "react-router";
import { Provider } from 'react-redux';
import { createHistory } from 'history';

import reducer from './reducers';

import { devMiddleware, renderDevTools } from './utils/devTools';


const store = compose(
    reduxReactRouter({ createHistory }),
    devMiddleware()
)(createStore)(reducer);

class Root extends Component {
    render() {
        return (
            <div>
                <Provider store={store}>
                    <ReduxRouter>
                    </ReduxRouter>
                </Provider>
                {renderDevTools(store)}
            </div>
        );
    }
}

ReactDOM.render(<Root />, document.getElementById('react-main'));
