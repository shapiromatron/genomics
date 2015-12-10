import React from 'react';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';
import List from '../components/Analysis/List';
import Form from '../components/Analysis/Form';
import Detail from '../components/Analysis/Detail';


@connect((state) => ({}))
class AnalysisApp extends React.Component {

  render() {
    return (
        <div>
            <BreadcrumbBar paths={[urls.dashboard]} current="Analyses" />
            <h1>Analysis container</h1>
            <Form />
            <Detail />
            <List />
        </div>
    );
  }
}

export default AnalysisApp;
