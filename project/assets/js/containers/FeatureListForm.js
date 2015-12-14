import _ from 'underscore';
import React from 'react';

import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { bindActionCreators } from 'redux';

import { postFeatureList, patchFeatureList } from '../actions/FeatureList';

import h from '../utils/helpers';

import FLForm from '../components/FeatureList/Form';
import Loading from '../components/Loading';


class FeatureListFormContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getObjectState(props);
    }

    componentWillReceiveProps(props) {
        this.setState(this.getObjectState(props));
    }

    getObjectState(props){
        let id = parseInt(props.params.id) || undefined;
        let object = _.findWhere(props.objects.items, {id});
        return {id, object};
    }

    handleSubmit(newObj){
        const { dispatch } = this.props;
        let success_cb = function(){
            dispatch(pushState(null, '/dashboard/feature-lists/'));
        };
        if (_.isUndefined(this.state.id)){
            dispatch(postFeatureList(newObj, success_cb));
        } else {
            let patch = h.getPatch(this.state.object, newObj);
            dispatch(patchFeatureList(this.state.id, patch, success_cb));
        }
    }

    render() {
        let id = this.state.id;
        let object = this.state.object;

        if (id && !object) return <Loading />;

        return (
            <FLForm
                id={id}
                object={object}
                handleSubmit={this.handleSubmit.bind(this)}
            />
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
export default connect(selector, mapDispatchToProps)(FeatureListFormContainer);
