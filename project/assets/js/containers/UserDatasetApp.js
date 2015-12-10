import React from 'react';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';
import List from '../components/UserDataset/List';
import Form from '../components/UserDataset/Form';
import Detail from '../components/UserDataset/Detail';


@connect((state) => ({}))
class UserDatasetApp extends React.Component {

  render() {
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} current="User datasets" />
                <h1>User dataset container</h1>
                <Form />
                <Detail />
                <List />
            </div>
        );
  }
}

export default UserDatasetApp;
