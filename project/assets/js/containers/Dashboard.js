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
                <BreadcrumbBar paths={[]} current="Dashboard" />
                <h1>Dashboard</h1>
                <p><Link to={urls.user_dataset.url}>My datasets</Link></p>
                <p><Link to={urls.feature_list.url}>My feature lists</Link></p>
                <p><Link to={urls.sort_vector.url}>My sort vectors</Link></p>
                <p><Link to={urls.analysis.url}>My analyses</Link></p>
            </div>
        );
    }
}

export default Dashboard;
