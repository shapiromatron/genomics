import React from 'react';
import { Link } from 'react-router';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';


class DataManagement extends React.Component {

    render() {
        return (
            <div>
                <BreadcrumbBar
                    paths={[urls.dashboard]}
                    current={urls.data_management.name} />
                <h1>Data management</h1>
                <Link className="pill" to={urls.user_dataset.url}>{urls.user_dataset.name}</Link>
                <Link className="pill" to={urls.feature_list.url}>{urls.feature_list.name}</Link>
                <Link className="pill" to={urls.analysis.url}>{urls.analysis.name}</Link>
            </div>
        );
    }
}

export default DataManagement;
