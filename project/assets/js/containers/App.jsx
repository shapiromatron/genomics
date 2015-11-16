import React, { Component } from 'react';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';

import { finalCreateStore, renderDevTools } from '../utils/devTools';
import UserDatasetApp from './UserDatasetApp';

import * as reducers from '../reducers';

const reducer = combineReducers(reducers);
const store = finalCreateStore(reducer);

export default class App extends Component {
  render() {
    return (
        <div>
            <Provider store={store}>
                <UserDatasetApp />
            </Provider>
            {renderDevTools(store)}
        </div>
    );
  }
}
