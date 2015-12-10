import React from 'react';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';
import List from '../components/SortVector/List';
import Form from '../components/SortVector/Form';
import Detail from '../components/SortVector/Detail';


@connect((state) => ({}))
class SortVectorApp extends React.Component {

    render() {
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} current="Sort vectors" />
                <h1>Sort vector container</h1>
                <Form />
                <Detail />
                <List />
            </div>
        );
    }
}

export default SortVectorApp;
