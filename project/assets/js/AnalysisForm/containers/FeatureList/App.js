import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import { fetchObjectsIfNeeded as flFetchObjectsIfNeeded } from 'actions/FeatureList';
import { fetchObjectsIfNeeded as svFetchObjectsIfNeeded } from 'actions/SortVector';
import Loading from 'components/Loading';


@connect((state) => (state))
class App extends React.Component {

    componentWillMount() {
        this.props.dispatch(flFetchObjectsIfNeeded());
        this.props.dispatch(svFetchObjectsIfNeeded());
    }

    render() {
        return <div>{this.props.children}</div>;
    }
}

export default App;
