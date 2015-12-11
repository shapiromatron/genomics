import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

import BreadcrumbBar from '../BreadcrumbBar';
import Loading from '../Loading';
import urls from '../../constants/urls';


class UserDatasetDetail extends React.Component {

    renderDeleteConfirmation() {
        let isDeleteConfirm = this.props.location.pathname.indexOf('/delete/') > 0;

        if (!isDeleteConfirm) return null;

        return (
            <form method="post">
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


export default connect(
  state => ({objects: state.feature_list}),
  { pushState }
)(UserDatasetDetail);
