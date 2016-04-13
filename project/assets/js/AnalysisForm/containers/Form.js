import React from 'react';
import { connect } from 'react-redux';

import Component from '../components/Form';


class Container extends React.Component {
    render() {
        return <Component isReady={this.props.isReady} />;
    }
}


function mapStateToProps(state) {
    return {
        isReady: state.startupContentReceived,
    };
}

export default connect(mapStateToProps)(Container);
