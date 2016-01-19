import $ from 'jQuery';
import React from 'react';
import EncodeFilterSelect from './EncodeFilterSelect';


class EncodeDatasetFiltering extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleApplyFilters(){
        console.log('apply filters');
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

    handleFilterChange(e){
        let obj = {};
        obj[e.target.name] = $(e.target).val();
        this.setState(obj);
    }

    render() {
        let opts = this.props.options,
            vals = this.state;

        return (
            <div>
            <div className='row'>
                <div className='col-md-12'>
                    <button type='button'
                            onClick={this.handleApplyFilters}
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

                <EncodeFilterSelect
                    label='Data type'
                    name='data_type'
                    options={opts.data_type}
                    values={vals.data_type || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Cell type'
                    name='cell_type'
                    options={opts.cell_type}
                    values={vals.cell_type || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Treatment'
                    name='treatment'
                    options={opts.treatment}
                    values={vals.treatment || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Antibody'
                    name='antibody'
                    options={opts.antibody}
                    values={vals.antibody || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Phase'
                    name='phase'
                    options={opts.phase}
                    values={vals.phase || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='RNA extract'
                    name='rna_extract'
                    options={opts.rna_extract}
                    values={[]}
                    handleChange={this.handleFilterChange.bind(this)} />

            </div>
            <div className='row'>
                <div className='col-md-5'>
                    <h4>Available datasets (after filtering)</h4>
                    <select size='10' className='form-control' multiple={true}>
                    </select>
                    <p><strong>Available:</strong> <span ref='nAvailable'>0</span></p>
                    <p><strong>Selected:</strong> <span ref='nAvailSelected'>0</span></p>
                </div>
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
}

EncodeDatasetFiltering.propTypes = {
    options: React.PropTypes.object.isRequired,
};

export default EncodeDatasetFiltering;
