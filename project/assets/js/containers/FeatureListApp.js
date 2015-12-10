import React from 'react';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';
import List from '../components/FeatureList/List';
import Form from '../components/FeatureList/Form';
import Detail from '../components/FeatureList/Detail';


@connect((state) => ({}))
class FeatureListApp extends React.Component {

    render() {
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} current="Feature lists" />
                <h1>Feature list container</h1>
                <Form />
                <Detail />
                <List />
            </div>
        );
    }
}

export default FeatureListApp;
