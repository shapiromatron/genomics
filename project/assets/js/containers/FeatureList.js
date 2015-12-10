import React from 'react';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';


@connect((state) => ({}))
class FeatureList extends React.Component {

    render() {
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} current="Feature lists" />
                <h1>Feature list container</h1>
            </div>
        );
    }
}

export default FeatureList;