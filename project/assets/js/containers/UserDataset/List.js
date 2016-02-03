import React from 'react';
import { connect } from 'react-redux';

import FL from 'components/UserDataset/List';


class List extends React.Component {
    render() {
        return <FL objects={this.props.objects}/>;
    }
}


function mapStateToProps(state) {
    return {
        objects: state.user_dataset,
    };
}

export default connect(mapStateToProps)(List);
