import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import Loading from '../../components/Loading';

import { fetchObjectsIfNeeded as anFetchObjectsIfNeeded } from '../../actions/Analysis';
import { fetchObjectsIfNeeded as flFetchObjectsIfNeeded } from '../../actions/FeatureList';
import { fetchObjectsIfNeeded as svFetchObjectsIfNeeded } from '../../actions/SortVector';


@connect((state) => (state))
class App extends React.Component {

    componentWillMount() {
        this.props.dispatch(anFetchObjectsIfNeeded());
        this.props.dispatch(flFetchObjectsIfNeeded());
        this.props.dispatch(svFetchObjectsIfNeeded());
    }

    render() {
        return <div>{this.props.children}</div>;
    }
}

export default App;
