import React from 'react';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';


@connect((state) => ({}))
class SortVector extends React.Component {

    render() {
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} current="Sort vectors" />
                <h1>Sort vector container</h1>
            </div>
        );
    }
}

export default SortVector;
