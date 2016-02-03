import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import { fetchObjectsIfNeeded } from 'actions/UserDataset';
import Loading from 'components/Loading';


@connect((state) => (state))
class App extends React.Component {

    componentWillMount() {
        this.props.dispatch(fetchObjectsIfNeeded());
    }

    render() {
        return <div>{this.props.children}</div>;
    }
}

export default App;
