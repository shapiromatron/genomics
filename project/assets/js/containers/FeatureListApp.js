import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import {
    fetchFeatureListsIfNeeded,
} from '../actions/FeatureList';


@connect((state) => (state))
class FeatureListApp extends React.Component {

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchFeatureListsIfNeeded());
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

export default FeatureListApp;
