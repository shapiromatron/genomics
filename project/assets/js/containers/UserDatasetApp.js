import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';


@connect((state) => ({}))
class UserDatasetApp extends React.Component {

  render() {
    return (
        <div>
            <BreadcrumbBar paths={[urls.dashboard]} current="User datasets" />
            <h1>User dataset container</h1>
        </div>
    );
  }
}

export default UserDatasetApp;
