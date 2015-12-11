import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

import BreadcrumbBar from '../BreadcrumbBar';
import urls from '../../constants/urls';


class UserDatasetForm extends React.Component {

    getBreadcrumbs(d) {
        let paths = [urls.dashboard, urls.feature_list];
        let name = (d) ? 'Update' : 'Create';
        if (d) paths.push({name: d.name, url: `${urls.feature_list.url}${d.id}/`});
        return <BreadcrumbBar paths={paths} current={name} />;
    }

    getTitle(d){
        return (d) ? `Update ${d.name}` : 'Create feature list';
    }

    render() {
        let id = parseInt(this.props.params.id) || null;
        let object = (id) ? _.findWhere(this.props.objects.items, {id}) : null;
        let breadcrumbs = this.getBreadcrumbs(object);
        let title = this.getTitle(object);

        return (
            <div>
                {breadcrumbs}
                <h2>{title}</h2>
            </div>
        );
    }
}

export default connect(
  state => ({objects: state.feature_list}),
  { pushState }
)(UserDatasetForm);
