import _ from 'underscore';
import React from 'react';

import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { bindActionCreators } from 'redux';

import Loading from '../../components/Loading';

import { deleteFeatureList } from '../../actions/FeatureList';

import FL from '../../components/FeatureList/Object.js';


class FeatureListDelete extends React.Component {

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
            deleteFeatureList(this.getObject().id,
            () => dispatch(pushState(null, '/dashboard/feature-lists/')))
        );
    }

    render() {
        let object = this.getObject();
        if (_.isUndefined(object)) return <Loading />;
        return (
            <FL
                object={object}
                isDelete={true}
                handleDeleteForm={this.handleDeleteForm.bind(this)} />
        );
    }
}

function mapStateToProps(state) {
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
export default connect(mapStateToProps, mapDispatchToProps)(FeatureListDelete);
