import _ from 'underscore';
import $ from 'jQuery';
import React from 'react';
import EncodeFilterSelect from './EncodeFilterSelect';
import h from '../../utils/helpers';


class EncodeDatasetFiltering extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filters: {},
        };
    }

    handleAddSelected(){
        console.log('add selected');
    }

    handleAddAll(){
        console.log('add all');
    }

    handleRemoveSelected(){
        console.log('remove selected');
    }

    handleRemoveAll(){
        console.log('remove all');
    }

    handleApplyFilters(){
        let filters = _.pick(h.deepCopy(this.state.filters), _.identity); // remove null
        this.props.handleApplyFilters(filters);
    }

    handleFilterChange(e){
        let obj = this.state.filters;
        obj[e.target.name] = $(e.target).val();
        this.setState(obj);
    }

    render() {
        let opts = this.props.options,
            vals = this.state.filters;
        return (
            <div>
            <div className='row'>
                <div className='col-md-12'>
                    <button type='button'
                            onClick={this.handleApplyFilters.bind(this)}
                            className='btn btn-primary pull-right'>
                            <i className='fa fa-filter'></i> Apply filters</button>
                    <p className='help-block'>
                        There are thousands of ENCODE datasets available for
                        comparing your dataest. Please select from the list of
                        filters below, then press filter to select a subset of
                        available ENCODE data. The, datasets of interest to your
                        project.
                    </p>
                </div>
            </div>
            <div className='row'>
                <EncodeFilterSelect
                    label='Data type'
                    name='data_type'
                    initiallyVisible={true}
                    options={opts.data_type}
                    values={vals.data_type || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Cell type'
                    name='cell_type'
                    initiallyVisible={true}
                    options={opts.cell_type}
                    values={vals.cell_type || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Treatment'
                    name='treatment'
                    initiallyVisible={true}
                    options={opts.treatment}
                    values={vals.treatment || []}
                    handleChange={this.handleFilterChange.bind(this)} />
            </div>
            <div className='row'>
                <EncodeFilterSelect
                    label='Antibody'
                    name='antibody'
                    initiallyVisible={false}
                    options={opts.antibody}
                    values={vals.antibody || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Phase'
                    name='phase'
                    initiallyVisible={false}
                    options={opts.phase}
                    values={vals.phase || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='RNA extract'
                    name='rna_extract'
                    initiallyVisible={false}
                    options={opts.rna_extract}
                    values={[]}
                    handleChange={this.handleFilterChange.bind(this)} />

            </div>
            <div className='row'>
                {this.renderAvailableDatasets()}
                <div className='col-md-2 text-center'>
                    <h4>&nbsp;</h4>
                    <button style={{marginTop: '1em'}}
                            type='button'
                            onClick={this.handleAddAll}
                            className='btn btn-default'>
                        Add all <i className='fa fa-angle-double-right'></i></button>
                    <br></br>
                    <button type='button'
                            onClick={this.handleAddSelected}
                            className='btn btn-default'>
                        Add <i className='fa fa-angle-right'></i></button>
                    <br></br>
                    <br></br>
                    <button type='button'
                            onClick={this.handleRemoveSelected}
                            className='btn btn-default'>
                        <i className='fa fa-angle-left'></i> Remove</button>
                    <br></br>
                    <button type='button'
                            onClick={this.handleRemoveAll}
                            className='btn btn-default'>
                        <i className='fa fa-angle-double-left'></i> Remove all</button>
                    <br></br>

                </div>
                <div className='col-md-5'>
                    <h4>Included datasets</h4>
                    <select size='10' className='form-control' multiple={true}>
                    </select>
                    <p><strong>Total included:</strong> <span ref='nIncluded'>0</span></p>
                    <p><strong>Total included:</strong> <span ref='nIncSelected'>0</span></p>
                </div>
            </div>
            </div>
        );
    }

    renderAvailableDatasets(){
        return (
            <div className='col-md-5'>
                <h4>Available datasets (after filtering)</h4>
                <select
                    ref='available'
                    size='10'
                    className='form-control' multiple={true}>
                    {this.props.availableDatasets.map(this.renderDatsetOption)}
                </select>
            </div>
        );
    }
}

EncodeDatasetFiltering.propTypes = {
    options: React.PropTypes.object.isRequired,
    handleApplyFilters: React.PropTypes.func.isRequired,
    availableDatasets: React.PropTypes.array.isRequired,
};

export default EncodeDatasetFiltering;
