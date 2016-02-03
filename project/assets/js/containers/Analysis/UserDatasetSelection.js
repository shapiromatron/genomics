import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import {
    changeEditObject,
} from 'actions/Analysis';

import Component from 'components/Analysis/UserDatasetSelection';


class Container extends React.Component {

    handleUserDatasetChange (includes, removes) {
        let selected = _.indexBy(this.props.object.analysis_user_datasets, 'dataset');
        if(includes){
            selected[includes.dataset] = includes;
        }
        if(removes){
            delete selected[removes];
        }
        this.props.dispatch(changeEditObject('analysis_user_datasets', _.values(selected)));
    }


    render() {
        let object = this.props.object;
        return (
            <Component
                allDatasets={this.props.user_datasets}
                selectedDatasets={object.analysis_user_datasets}
                genome_assembly={object.genome_assembly}
                handleUserDatasetChange={this.handleUserDatasetChange.bind(this)}/>
        );
    }
}

function mapStateToProps(state) {
    return {
        object: state.analysis.editObject,
        user_datasets: state.user_dataset.items,
    };
}
export default connect(mapStateToProps)(Container);
