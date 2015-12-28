import React from 'react';
import { pushState } from 'redux-router';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';


@connect((state) => ({}))
class Dashboard extends React.Component {
    /* TODO: manage-data page should do all the fetchIfNeeded options */

    renderDashboard(){
        return (
            <div>
                <h1>Dashboard</h1>

                <h2>Your completed analyses</h2>
                <p className='help-block'>You have no completed analyses (or list)</p>


                <h2>Your running analyses</h2>
                <p className='help-block'>You have no running analyses (or list)</p>

                <h2> Manage my data</h2>
                <ul className="nav nav-pills">
                    <Link className="pill" to={urls.user_dataset.url}>{urls.user_dataset.name}</Link>
                    <Link className="pill" to={urls.feature_list.url}>{urls.feature_list.name}</Link>
                    <Link className="pill" to={urls.analysis.url}>{urls.analysis.name}</Link>
                </ul>
            </div>
        )
    }

    render() {
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} />
                {this.props.children || this.renderDashboard()}
            </div>
        );
    }
}

export default Dashboard;
