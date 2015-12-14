import _ from 'underscore';
import React from 'react';

import BreadcrumbBar from '../BreadcrumbBar';
import Loading from '../Loading';
import urls from '../../constants/urls';

import { deleteFeatureList } from '../../actions/FeatureList';


class UserDatasetDetail extends React.Component {

    handleDeleteForm(e){
        const { dispatch } = this.props;
        e.preventDefault();
        let success_cb = function(){
            dispatch(pushState(null, '/dashboard/feature-lists/'));
        };
        dispatch(deleteFeatureList(parseInt(this.props.params.id), success_cb));
    }

    renderDeleteConfirmation() {
        let isDeleteConfirm = this.props.location.pathname.indexOf('/delete/') > 0;

        if (!isDeleteConfirm) return null;

        return (
            <form method="post" onSubmit={this.handleDeleteForm.bind(this)}>
                <p>Are you sure you want to delete?</p>
                <button className='btn btn-danger' type="submit">Confirm delete</button>
            </form>
        );
    }

    render() {
        let object = _.findWhere(this.props.objects.items, {id: parseInt(this.props.params.id)});
        if (_.isUndefined(object)) return <Loading />;
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard, urls.feature_list]} current={object.name} />
                <h2>{object.name}</h2>
                {this.renderDeleteConfirmation()}
            </div>
        );
    }
}


import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { bindActionCreators } from 'redux';

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
export default connect(selector, mapDispatchToProps)(UserDatasetDetail);
