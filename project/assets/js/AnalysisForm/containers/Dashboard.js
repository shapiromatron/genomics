import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { fetchObjectsIfNeeded as anFetchObjectsIfNeeded } from 'actions/Analysis';
import { fetchObjectsIfNeeded as flFetchObjectsIfNeeded } from 'actions/FeatureList';
import { fetchObjectsIfNeeded as svFetchObjectsIfNeeded } from 'actions/SortVector';
import { fetchObjectsIfNeeded as udFetchObjectsIfNeeded } from 'actions/UserDataset';
import urls from 'constants/urls';
import BreadcrumbBar from 'components/BreadcrumbBar';
import Loading from 'components/Loading';
import Dashboard from 'components/Dashboard';


@connect((state) => (state))
class Component extends React.Component {

    componentWillMount() {
        this.props.dispatch(udFetchObjectsIfNeeded());
        this.props.dispatch(anFetchObjectsIfNeeded());
        this.props.dispatch(flFetchObjectsIfNeeded());
        this.props.dispatch(svFetchObjectsIfNeeded());
    }

    isLoaded(){
        return (
            this.props.analysis.itemsLoaded &&
            this.props.feature_list.itemsLoaded &&
            this.props.sort_vector.itemsLoaded &&
            this.props.user_dataset.itemsLoaded
        );
    }

    render() {
        let loaded = this.isLoaded();
        return (
            <div>
                {
                    this.props.children ||
                    <Dashboard isLoaded={loaded} analysis={this.props.analysis}/>
                }
            </div>
        );
    }
}

export default Component;
