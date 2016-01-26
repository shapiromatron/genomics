import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import {
    fetchEncodeOptionsIfNeeded,
    requestEncodeDatasets,
    changeEditObject,
} from '../../actions/Analysis';

import Loading from '../../components/Loading';
import Component from '../../components/Analysis/EncodeDatasetFiltering';


class Container extends React.Component {

    componentWillMount() {
        this.props.dispatch(fetchEncodeOptionsIfNeeded());
    }

    handleApplyFilters(filters){
        this.props.dispatch(requestEncodeDatasets(filters));
    }

    handleSelectionChange(additions, deletions){
        let selected = _.indexBy(this.props.model.editObject.analysis_encode_datasets, 'dataset');
        if(additions){
            additions
                .filter(d => _.isUndefined(selected[d.dataset]))
                .forEach(d => selected[d.dataset] = d);
        }
        if(deletions){
            deletions.forEach(d => delete selected[d.dataset]);
        }
        this.props.dispatch(changeEditObject('analysis_encode_datasets', _.values(selected)));
    }

    isReadyToRender(){
        return this.props.model.encodeOptions !== null;
    }

    render() {
        let model = this.props.model;
        if (!this.isReadyToRender()) return <Loading />;
        return (
            <Component
                options={model.encodeOptions}
                handleApplyFilters={this.handleApplyFilters.bind(this)}
                availableDatasets={model.encodeDatasetsAvailable}
                handleSelectionChange={this.handleSelectionChange.bind(this)}
                selectedDatasets={this.props.model.editObject.analysis_encode_datasets}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        model: state.analysis,
    };
}
export default connect(mapStateToProps)(Container);
