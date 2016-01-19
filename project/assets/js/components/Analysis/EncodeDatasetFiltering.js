import React from 'react';


class EncodeDatasetFiltering extends React.Component {

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

    render() {
        let opts = this.props.options;
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

                <div className='col-md-4'>
                    <label className='control-label'>Data type</label>
                    <button className='pull-right btn btn-xs' type='button'>All</button>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.data_type.map(
                           (d, i) => <option key={i} value={d}>{d || '-'}</option>
                        )}
                    </select>
                </div>

                <div className='col-md-4'>
                    <label className='control-label'>Cell type</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.data_type.map(
                           (d, i) => <option key={i} value={d}>{d || '-'}</option>
                        )}
                    </select>
                </div>

                <div className='col-md-4'>
                    <label className='control-label'>Treatment</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.treatment.map(
                           (d, i) => <option key={i} value={d}>{d || '-'}</option>
                        )}
                    </select>
                </div>

                <div className='col-md-4'>
                    <label className='control-label'>Antibody</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.antibody.map(
                           (d, i) => <option key={i} value={d}>{d}</option>
                        )}
                    </select>
                </div>

                <div className='col-md-4'>
                    <label className='control-label'>Phase</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.phase.map(
                           (d, i) => <option key={i} value={d}>{d || '-'}</option>
                        )}
                    </select>
                </div>

                <div className='col-md-4'>
                    <label className='control-label'>RNA extract</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.rna_extract.map(
                           (d, i) => <option key={i} value={d}>{d || '-'}</option>
                        )}
                    </select>
                </div>

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
