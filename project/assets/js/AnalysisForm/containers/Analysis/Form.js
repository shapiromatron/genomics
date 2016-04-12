import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { bindActionCreators } from 'redux';

import h from 'utils/helpers';

import {
    postObject, patchObject,
    initializeEditForm, fetchEncodeOptionsIfNeeded,
    changeEditObject,
} from 'actions/Analysis';

import Component from 'components/Analysis/Form';
import Loading from 'components/Loading';


class Container extends React.Component {

    componentWillMount() {
        let id = this.getID();
        this.props.dispatch(initializeEditForm(id));
        this.props.dispatch(fetchEncodeOptionsIfNeeded());
    }

    getID() {
        return parseInt(this.props.params.id) || null;
    }

    getObject() {
        let id = this.getID();
        if (id) return _.findWhere(this.props.model.items, {id});
        return null;
    }

    handleSubmit(){
        const { dispatch } = this.props;
        let newObj = this.props.model.editObject,
            id = this.getID(),
            cb = () => h.goBack();
        if (id){
            let patch = h.getPatch(this.getObject(), newObj);
            dispatch(patchObject(id, patch, cb));
        } else {
            dispatch(postObject(newObj, cb));
        }
    }

    handleModelChange(key, value){
        this.props.dispatch(changeEditObject(key, value));
    }

    isReadyToRender(){
        let id = this.getID(),
            model = this.props.model;

        if (id && model.editObject === null ||
            id && model.editObject && id !== model.editObject.id)
            return false;

        if (id === null && model.editObject === null ||
            id === null && model.editObject && model.editObject.id !== null)
            return false;

        return (model.itemsLoaded && model.editObject !== null);
    }

    render() {
        let model = this.props.model;
        if (!this.isReadyToRender()) return <Loading />;
        return (
            <Component
                object={model.editObject}
                feature_lists={this.props.feature_list}
                sort_vectors={this.props.sort_vector}
                user_datasets={this.props.user_dataset}
                errors={model.editObjectErrors}
                handleSubmit={this.handleSubmit.bind(this)}
                handleModelChange={this.handleModelChange.bind(this)}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        model: state.analysis,
        feature_list: state.feature_list.items,
        sort_vector: state.sort_vector.items,
    };
}
function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        pushState: bindActionCreators(pushState, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Container);
