import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, compose, applyMiddleware } from 'redux';
import { ReduxRouter, reduxReactRouter } from 'redux-router';
import thunk from 'redux-thunk';

import { Route, IndexRoute } from 'react-router';
import { Provider } from 'react-redux';
import { createHistory } from 'history';

import { devMiddleware, renderDevTools } from './utils/devTools';

import Dashboard from './containers/Dashboard';
import UserDatasetApp from './containers/UserDatasetApp';


import FLApp from    './containers/FeatureList/App';
import FLForm from   './containers/FeatureList/Form';
import FLList from   './containers/FeatureList/List';
import FLDetail from './containers/FeatureList/Detail';
import FLDelete from './containers/FeatureList/Delete';

import SortVectorApp from './containers/SortVectorApp';
import AnalysisApp from './containers/AnalysisApp';
import reducer from './reducers';
import urls from './constants/urls';
import { loadConfig } from './actions/Config';


const middleware = [ thunk ];
const store = compose(
    applyMiddleware(...middleware),
    reduxReactRouter({ createHistory }),
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
                    <ReduxRouter>
                        <Route path={urls.dashboard.url} component={Dashboard}></Route>
                        <Route path={urls.user_dataset.url} component={UserDatasetApp}></Route>
                        <Route path={urls.feature_list.url} component={FLApp}>
                            <IndexRoute component={FLList} />
                            <Route path="create/" component={FLForm} />
                            <Route path=":id/" component={FLDetail} />
                            <Route path=":id/update/" component={FLForm} />
                            <Route path=":id/delete/" component={FLDelete} />
                        </Route>
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
