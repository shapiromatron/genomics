import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, compose } from 'redux';

import { ReduxRouter, reduxReactRouter } from 'redux-router';

import { Route } from 'react-router';
import { Provider } from 'react-redux';
import { createHistory } from 'history';

import Dashboard from './containers/Dashboard';
import UserDataset from './containers/UserDataset';
import reducer from './reducers';

import { devMiddleware, renderDevTools } from './utils/devTools';


const store = compose(
    reduxReactRouter({ createHistory }),
    devMiddleware()
)(createStore)(reducer);

class Root extends React.Component {
    render() {
        return (
            <div>
                <Provider store={store}>
                    <ReduxRouter>
                        <Route path='/dashboard/' component={Dashboard}></Route>
                        <Route path='/dashboard/user-datasets/' component={UserDataset}></Route>
                    </ReduxRouter>
                </Provider>
                {renderDevTools(store)}
            </div>
        );
    }
}

ReactDOM.render(<Root />, document.getElementById('react-main'));
