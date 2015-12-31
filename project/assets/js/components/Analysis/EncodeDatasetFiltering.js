import React from 'react';


class EncodeDatasetFiltering extends React.Component {

    render () {
        let opts = this.props.options;

        return (
            <div className='row'>

                <div className='col-sm-4'>
                    <label className='control-label'>Data type</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.data_type.map(
                           (d) => <option key={d} value={d}>{d}</option>
                        )}
                    </select>
                </div>

                <div className='col-sm-4'>
                    <label className='control-label'>Cell type</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.cell_type.map(
                           (d) => <option key={d} value={d}>{d}</option>
                        )}
                    </select>
                </div>

                <div className='col-sm-4'>
                    <label className='control-label'>Treatment</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.treatment.map(
                           (d) => <option key={d} value={d}>{d}</option>
                        )}
                    </select>
                </div>

                <div className='col-sm-4'>
                    <label className='control-label'>Phase</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.phase.map(
                           (d) => <option key={d} value={d}>{d}</option>
                        )}
                    </select>
                </div>

                <div className='col-sm-4'>
                    <label className='control-label'>RNA extract</label>
                    <select size='10' className='form-control' multiple={true}>
                        {opts.rna_extract.map(
                           (d) => <option key={d} value={d}>{d}</option>
                        )}
                    </select>
                </div>

            </div>
        );
    }

}

EncodeDatasetFiltering.propTypes = {
    options: React.PropTypes.object.isRequired,
};

export default EncodeDatasetFiltering;
