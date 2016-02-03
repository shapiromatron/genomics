import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { bindActionCreators } from 'redux';

import { deleteObject } from 'actions/Analysis';
import Loading from 'components/Loading';
import Component from 'components/Analysis/Object';
import urls from 'constants/urls';


class Container extends React.Component {

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
                () => dispatch(pushState(null, urls.dashboard.url))
            )
        );
    }

    render() {
        let object = this.getObject();
        if (_.isUndefined(object)) return <Loading />;
        return (
            <Component
                object={object}
                isDelete={true}
                handleDeleteForm={this.handleDeleteForm.bind(this)} />
        );
    }
}

function mapStateToProps(state) {
    return {
        objects: state.analysis,
    };
}
function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        pushState: bindActionCreators(pushState, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Container);
