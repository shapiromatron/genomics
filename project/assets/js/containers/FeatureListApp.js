import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import urls from '../constants/urls';
import BreadcrumbBar from '../components/BreadcrumbBar';
import List from '../components/FeatureList/List';
import Form from '../components/FeatureList/Form';
import Detail from '../components/FeatureList/Detail';
import {
    fetchFeatureListsIfNeeded,
} from '../actions/FeatureList';


@connect((state) => (state))
class FeatureListApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {crud: 'list', id: null};
    }

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchFeatureListsIfNeeded());
    }

    onCreateClick() {
        this.setState({crud: 'create'});
    }

    renderList() {
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} current="Feature lists" />
                <h1>Feature lists
                    <button className="pull-right btn btn-primary" onClick={this.onCreateClick.bind(this)}>Create new</button>
                </h1>
                <List objects={this.props.feature_list} />
            </div>
        );
    }

    renderCreate(){
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard, urls.feature_list]} current="Create" />
                <h1>Create feature list</h1>
                <Form />
            </div>
        );
    }

    renderRead(){
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard, urls.feature_list]} current="Detail" />
                <h1>Feature list detail</h1>
                <Form />
            </div>
        );
    }

    renderUpdate(){
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard, urls.feature_list]} current="Update" />
                <h1>Update feature list</h1>
                <Form />
            </div>
        );
    }

    renderDelete(){
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard, urls.feature_list]} current="Delete" />
                <h1>Delete feature list</h1>
                <Form />
            </div>
        );
    }

    render() {
        switch (this.state.crud) {
        case 'create':
            return this.renderCreate();
        case 'read':
            return this.renderRead();
        case 'update':
            return this.renderUpdate();
        case 'delete':
            return this.renderDelete();
        case 'list':
        default:
            return this.renderList();
        }
    }
}

export default FeatureListApp;
