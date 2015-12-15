import _ from 'underscore';
import React from 'react';

import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { bindActionCreators } from 'redux';

import Loading from '../components/Loading';

import { deleteFeatureList } from '../actions/FeatureList';

import FL from '../components/FeatureList/Object.js';


class FeatureListObject extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getState(props);
    }

    componentWillReceiveProps(props) {
        this.setState(this.getState(props));
    }

    getState(props){
        return {
            isDelete: props.location.pathname.indexOf('/delete/') > 0,
            id: parseInt(props.params.id),
        };
    }

    getObject() {
        return _.findWhere(this.props.objects.items, {id: this.state.id});
    }

    handleDeleteForm(e){
        const { dispatch } = this.props;
        e.preventDefault();
        let success_cb = function(){
            dispatch(pushState(null, '/dashboard/feature-lists/'));
        };
        dispatch(deleteFeatureList(this.state.id, success_cb));
    }

    render() {
        let object = this.getObject();
        if (_.isUndefined(object)) return <Loading />;
        return (
            <FL
                object={object}
                isDelete={this.state.isDelete}
                handleDeleteForm={this.handleDeleteForm.bind(this)} />
        );
    }
}

function selector(state) {
    return {
        objects: state.feature_list,
    };
}
function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        pushState: bindActionCreators(pushState, dispatch),
    };
}
export default connect(selector, mapDispatchToProps)(FeatureListObject);
