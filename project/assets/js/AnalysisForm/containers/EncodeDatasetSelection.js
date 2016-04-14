import React from 'react';
import { connect } from 'react-redux';

import Component from '../components/EncodeDatasetFiltering';

import {requestEncodeDatasets} from '../actions';


class Container extends React.Component {

    handleApplyFilters(filters){
        filters['genome_assembly'] = this.props.genome_assembly;
        this.props.dispatch(requestEncodeDatasets(filters));
    }

    handleSelectionChange(additions, deletions){
        console.log('to fix');
        // let selected = _.indexBy(this.props.model.editObject.analysis_encode_datasets, 'dataset');
        // if(additions){
        //     additions
        //         .filter(d => _.isUndefined(selected[d.dataset]))
        //         .forEach(d => selected[d.dataset] = d);
        // }
        // if(deletions){
        //     deletions.forEach(d => delete selected[d.dataset]);
        // }
        // this.props.dispatch(changeEditObject('analysis_encode_datasets', _.values(selected)));
    }

    render() {
        return (
            <Component
                genome_assembly={this.props.genome_assembly}
                options={this.props.encodeOptions}
                handleApplyFilters={this.handleApplyFilters.bind(this)}
                availableDatasets={this.props.encodeDatasetsAvailable}
                handleSelectionChange={this.handleSelectionChange.bind(this)}
                selectedDatasets={[]} // to fix
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        genome_assembly: state.genome_assembly,
        encodeOptions: state.encodeOptions,
        encodeDatasetsAvailable: state.encodeDatasetsAvailable,
        editObject: {analysis_encode_datasets: []},
    };
}
export default connect(mapStateToProps)(Container);
