import React from 'react';

import urls from '../constants/urls';
import BreadcrumbBar from './BreadcrumbBar';

import FL from './FeatureList/List';
import SV from './SortVector/List';
import UD from './UserDataset/List';


class DataManagement extends React.Component {

    render () {
        return (
            <div>
                <BreadcrumbBar
                    paths={[urls.dashboard]}
                    current={urls.data_management.name} />

                <h1>Data management</h1>

                <div className='row'>
                    <div className='col-sm-6'>
                        <FL objects={this.props.feature_list} hideCrumbs={true} />
                        <SV objects={this.props.sort_vector} hideCrumbs={true} />
                    </div>
                    <div className='col-sm-6'>
                        <UD objects={this.props.user_dataset} hideCrumbs={true} />
                    </div>
                </div>

            </div>
        );
    }
}

DataManagement.propTypes = {
    feature_list: React.PropTypes.object,
    sort_vector: React.PropTypes.object,
    user_dataset: React.PropTypes.object,
};

export default DataManagement;
