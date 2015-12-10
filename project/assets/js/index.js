import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, compose } from 'redux';

import { ReduxRouter, reduxReactRouter } from 'redux-router';

import { Route } from 'react-router';
import { Provider } from 'react-redux';
import { createHistory } from 'history';

import Dashboard from './containers/Dashboard';
import UserDatasetApp from './containers/UserDatasetApp';
import FeatureListApp from './containers/FeatureListApp';
import SortVectorApp from './containers/SortVectorApp';
import AnalysisApp from './containers/AnalysisApp';
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
                        <Route path={urls.user_dataset.url} component={UserDatasetApp}></Route>
                        <Route path={urls.feature_list.url} component={FeatureListApp}></Route>
                        <Route path={urls.sort_vector.url} component={SortVectorApp}></Route>
                        <Route path={urls.analysis.url} component={AnalysisApp}></Route>
                    </ReduxRouter>
                </Provider>
                {renderDevTools(store)}
            </div>
        );
    }
}

ReactDOM.render(<Root />, document.getElementById('react-main'));
