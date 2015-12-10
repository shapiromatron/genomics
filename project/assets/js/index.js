import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, compose } from 'redux';

import { ReduxRouter, reduxReactRouter } from 'redux-router';

import { Route } from 'react-router';
import { Provider } from 'react-redux';
import { createHistory } from 'history';

import Dashboard from './containers/Dashboard';
import UserDataset from './containers/UserDataset';
import FeatureList from './containers/FeatureList';
import SortVector from './containers/SortVector';
import Analysis from './containers/Analysis';
import reducer from './reducers';
import urls from './constants/urls';

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
                        <Route path={urls.dashboard.url} component={Dashboard}></Route>
                        <Route path={urls.user_dataset.url} component={UserDataset}></Route>
                        <Route path={urls.feature_list.url} component={FeatureList}></Route>
                        <Route path={urls.sort_vector.url} component={SortVector}></Route>
                        <Route path={urls.analysis.url} component={Analysis}></Route>
                    </ReduxRouter>
                </Provider>
                {renderDevTools(store)}
            </div>
        );
    }
}

ReactDOM.render(<Root />, document.getElementById('react-main'));
