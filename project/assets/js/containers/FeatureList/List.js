import React from 'react';
import { connect } from 'react-redux';

import FL from 'components/FeatureList/List';


class List extends React.Component {
    render() {
        return <FL objects={this.props.objects}/>;
    }
}


function mapStateToProps(state) {
    return {
        objects: state.feature_list,
    };
}

export default connect(mapStateToProps)(List);
