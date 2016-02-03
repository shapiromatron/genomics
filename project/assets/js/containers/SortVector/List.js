import React from 'react';
import { connect } from 'react-redux';

import SV from 'components/SortVector/List';


class List extends React.Component {
    render() {
        return <SV parent_id={undefined}
                   objects={this.props.objects}/>;
    }
}


function mapStateToProps(state) {
    return {
        objects: state.sort_vector,
    };
}

export default connect(mapStateToProps)(List);
