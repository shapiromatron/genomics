import React, { Component, PropTypes } from 'react';
import { pushState } from 'redux-router';
import { Link } from "react-router";
import { connect } from 'react-redux';


@connect((state) => ({}))
class App extends Component {
  static propTypes = {
    children: PropTypes.node
  }

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    const { dispatch } = this.props;
    dispatch(pushState(null, '/dashboard/parent/child/custom'));
  }

  render() {
    const links = [
      '/dashboard/',
      '/dashboard/parent?foo=bar',
      '/dashboard/parent/child?bar=baz',
      '/dashboard/parent/child/123?baz=foo'
    ].map(l =>
      <p>
        <Link to={l}>{l}</Link>
      </p>
    );

    return (
      <div>
        <h1>Base app container</h1>
        {links}
        <a href="#" onClick={this.handleClick}>
          /dashboard/parent/child/custom
        </a>
        {this.props.children}
      </div>
    );
  }
}

export default App;
