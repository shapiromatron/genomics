import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { bindActionCreators } from 'redux';

import { deleteObject } from 'actions/SortVector';
import Loading from 'components/Loading';
import SV from 'components/SortVector/Object';
import urls from 'constants/urls';


class Delete extends React.Component {

    getObject(){
        return _.findWhere(
            this.props.objects.items,
            {id: parseInt(this.props.params.id)}
        );
    }

    handleDeleteForm(e){
        const { dispatch } = this.props;
        e.preventDefault();
        dispatch(
            deleteObject(
                this.getObject().id,
                () => dispatch(pushState(null, urls.sort_vector.url))
            )
        );
    }

    render() {
        let object = this.getObject();
        if (_.isUndefined(object)) return <Loading />;
        return (
            <SV
                object={object}
                isDelete={true}
                handleDeleteForm={this.handleDeleteForm.bind(this)} />
        );
    }
}

function mapStateToProps(state) {
    return {
        objects: state.sort_vector,
    };
}
function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        pushState: bindActionCreators(pushState, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Delete);
