import React from 'react';
import { connect } from 'react-redux';

import Component from 'components/Analysis/List';


class Container extends React.Component {
    render() {
        return <Component objects={this.props.objects}/>;
    }
}


function mapStateToProps(state) {
    return {
        objects: state.analysis,
    };
}

export default connect(mapStateToProps)(Container);
