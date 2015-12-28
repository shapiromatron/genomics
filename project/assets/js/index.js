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

import UDApp from    './containers/UserDataset/App';
import UDForm from   './containers/UserDataset/Form';
import UDList from   './containers/UserDataset/List';
import UDDetail from './containers/UserDataset/Detail';
import UDDelete from './containers/UserDataset/Delete';

import FLApp from    './containers/FeatureList/App';
import FLForm from   './containers/FeatureList/Form';
import FLList from   './containers/FeatureList/List';
import FLDetail from './containers/FeatureList/Detail';
import FLDelete from './containers/FeatureList/Delete';

import SVApp from    './containers/SortVector/App';
import SVForm from   './containers/SortVector/Form';
import SVList from   './containers/SortVector/List';
import SVDetail from './containers/SortVector/Detail';
import SVDelete from './containers/SortVector/Delete';

import ANApp from    './containers/Analysis/App';
import ANForm from   './containers/Analysis/Form';
import ANList from   './containers/Analysis/List';
import ANDetail from './containers/Analysis/Detail';
import ANDelete from './containers/Analysis/Delete';

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
                        <Route path={urls.user_dataset.url} component={UDApp}>
                            <IndexRoute component={UDList} />
                            <Route path="create/" component={UDForm} />
                            <Route path=":id/" component={UDDetail} />
                            <Route path=":id/update/" component={UDForm} />
                            <Route path=":id/delete/" component={UDDelete} />
                        </Route>
                        <Route path={urls.feature_list.url} component={FLApp}>
                            <IndexRoute component={FLList} />
                            <Route path="create/" component={FLForm} />
                            <Route path=":id/" component={FLDetail} />
                            <Route path=":id/update/" component={FLForm} />
                            <Route path=":id/delete/" component={FLDelete} />
                        </Route>
                        <Route path={urls.sort_vector.url} component={SVApp}>
                            <IndexRoute component={SVList} />
                            <Route path="create/" component={SVForm} />
                            <Route path=":id/" component={SVDetail} />
                            <Route path=":id/update/" component={SVForm} />
                            <Route path=":id/delete/" component={SVDelete} />
                        </Route>
                        <Route path={urls.analysis.url} component={ANApp}>
                            <IndexRoute component={ANList} />
                            <Route path="create/" component={ANForm} />
                            <Route path=":id/" component={ANDetail} />
                            <Route path=":id/update/" component={ANForm} />
                            <Route path=":id/delete/" component={ANDelete} />
                        </Route>
                    </ReduxRouter>
                </Provider>
                {renderDevTools(store)}
            </div>
        );
    }
}

ReactDOM.render(<Root />, document.getElementById('react-main'));
