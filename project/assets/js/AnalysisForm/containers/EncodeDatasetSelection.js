import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import Component from '../components/EncodeDatasetFiltering';

import {
    requestEncodeDatasets,
    changeSelectedEncode,
} from '../actions';


class Container extends React.Component {

    handleApplyFilters(filters){
        filters['genome_assembly'] = this.props.genome_assembly;
        this.props.dispatch(requestEncodeDatasets(filters));
    }

    handleSelectionChange(additions, deletions){
        let selected = _.indexBy(this.props.encodeSelected, 'dataset');
        if(additions){
            additions
                .filter(d => _.isUndefined(selected[d.dataset]))
                .forEach(d => selected[d.dataset] = d);
        }
        if(deletions){
            deletions.forEach(d => delete selected[d.dataset]);
        }
        this.props.dispatch(changeSelectedEncode(_.values(selected)));
    }

    render() {
        return (
            <Component
                genome_assembly={this.props.genome_assembly}
                options={this.props.encodeOptions}
                handleApplyFilters={this.handleApplyFilters.bind(this)}
                availableDatasets={this.props.encodeDatasetsAvailable}
                handleSelectionChange={this.handleSelectionChange.bind(this)}
                selectedDatasets={this.props.encodeSelected}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        genome_assembly: state.genome_assembly,
        encodeOptions: state.encodeOptions,
        encodeDatasetsAvailable: state.encodeDatasetsAvailable,
        encodeSelected: state.encodeSelected,
    };
}
export default connect(mapStateToProps)(Container);
