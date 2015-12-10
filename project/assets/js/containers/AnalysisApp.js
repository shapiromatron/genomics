import React from 'react';
import { connect } from 'react-redux';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';


@connect((state) => ({}))
class AnalysisApp extends React.Component {

  render() {
    return (
        <div>
            <BreadcrumbBar paths={[urls.dashboard]} current="Analyses" />
            <h1>Analysis container</h1>
        </div>
    );
  }
}

export default AnalysisApp;
