import React from 'react';
import FormFieldError from './FormFieldError';
import h from '../utils/helpers';


class GenomeAssemblySelect extends React.Component {

    render() {
        return (
        <div className={h.getInputDivClass('genome_assembly', this.props.errors)}>
            <label className='col-sm-2 control-label'>Genomic assembly</label>
            <div className='col-sm-10'>
                <select type='checkbox' className='form-control'
                        name='genome_assembly'
                        value={this.props.value}
                        onChange={this.props.handleChange} >
                    <option value=''>---</option>
                    <option value='1'>hg19</option>
                    <option value='2'>mm9</option>
                </select>
                <FormFieldError errors={this.props.errors.genome_assembly} />
            </div>
        </div>
        );
    }
}


GenomeAssemblySelect.propTypes = {
    errors: React.PropTypes.object,
    value: React.PropTypes.number,
    handleChange: React.PropTypes.func.isRequired,
};

export default GenomeAssemblySelect;
