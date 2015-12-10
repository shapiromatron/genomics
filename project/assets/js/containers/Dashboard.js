import React from 'react';
import { pushState } from 'redux-router';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';


@connect((state) => ({}))
class Dashboard extends React.Component {

    render() {
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} />
                <h1>Dashboard</h1>
                <p><Link to={urls.user_dataset.url}>{urls.user_dataset.name}</Link></p>
                <p><Link to={urls.feature_list.url}>{urls.feature_list.name}</Link></p>
                <p><Link to={urls.sort_vector.url}>{urls.sort_vector.name}</Link></p>
                <p><Link to={urls.analysis.url}>{urls.analysis.name}</Link></p>
            </div>
        );
    }
}

export default Dashboard;
