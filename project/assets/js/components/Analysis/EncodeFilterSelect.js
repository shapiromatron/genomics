import React from 'react';


class EncodeFilterSelect extends React.Component {


    render() {
        return (
            <div className='col-md-4'>
                <label className='control-label'>{this.props.label}</label>
                <select
                    size='10' className='form-control'
                    name={this.props.name}
                    multiple={true}
                    value={this.props.selected}
                    onChange={this.props.handleChange} >
                    {this.props.options.map(
                       (d, i) => <option key={i} value={d}>{d || '-'}</option>
                    )}
                </select>
            </div>
        );
    }
}

EncodeFilterSelect.propTypes = {
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    options: React.PropTypes.array.isRequired,
    values: React.PropTypes.array.isRequired,
    handleChange: React.PropTypes.func.isRequired,
};

export default EncodeFilterSelect;
