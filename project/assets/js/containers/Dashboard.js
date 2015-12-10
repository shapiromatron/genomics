import React from 'react';
import { pushState } from 'redux-router';
import { Link } from 'react-router';
import { connect } from 'react-redux';


@connect((state) => ({}))
class Dashboard extends React.Component {

  render() {
    return (
      <div>
        <h1>Dashboard main</h1>
        <p><Link to='/dashboard/user-datasets/'>My datasets</Link></p>
      </div>
    );
  }
}

export default Dashboard;
