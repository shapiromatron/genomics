import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import Component from '../components/UserDatasetSelection';
import RequireGenomeAssembly from '../components/RequireGenomeAssembly';

import {
    changeSelectedUserDatasets,
} from '../actions';


class Container extends React.Component {

    handleUserDatasetChange (includes, removes) {
        let selected = _.indexBy(this.props.userDatasetsSelected, 'dataset');
        if(includes){
            selected[includes.dataset] = includes;
        }
        if(removes){
            delete selected[removes];
        }
        this.props.dispatch(changeSelectedUserDatasets(_.values(selected)));
    }


    render() {
        if (!_.isFinite(this.props.genome_assembly)){
            return <RequireGenomeAssembly />;
        }
        return (
            <Component
                allDatasets={_.values(this.props.userDatasets)}
                selectedDatasets={this.props.userDatasetsSelected}
                genome_assembly={this.props.genome_assembly}
                handleUserDatasetChange={this.handleUserDatasetChange.bind(this)}/>
        );
    }
}

function mapStateToProps(state) {
    return {
        userDatasets: state.userDatasets,
        userDatasetsSelected: state.userDatasetsSelected,
        genome_assembly: state.genome_assembly,
    };
}
export default connect(mapStateToProps)(Container);
