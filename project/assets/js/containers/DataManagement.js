import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';

import DataManagement from '../components/DataManagement';


@connect((state) => (state))
class Component extends React.Component {

    render() {
        return <DataManagement
            feature_list={this.props.feature_list}
            sort_vector={this.props.sort_vector}
            user_dataset={this.props.user_dataset} />
    }
}

export default Component;
