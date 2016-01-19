import React from 'react';


class EncodeFilterSelect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {display: this.props.initiallyVisibile};
    }

    handleVisibility() {
        this.setState({display: !this.state.display});
    }

    render() {
        let visible = (this.state.display) ? 'inherit' : 'none',
            visibleIcon = (this.state.display) ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o';
        return (
            <div className='col-md-4'>
                <label className='control-label'>{this.props.label}</label>
                <div className='pull-right' title='Show/hide'
                    style={{cursor: 'pointer'}}
                    onClick={this.handleVisibility.bind(this)}>
                    <i className={visibleIcon}></i>
                </div>
                <select
                    style={{display: visible}}
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
    initiallyVisibile: React.PropTypes.bool.isRequired,
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    options: React.PropTypes.array.isRequired,
    values: React.PropTypes.array.isRequired,
    handleChange: React.PropTypes.func.isRequired,
};

export default EncodeFilterSelect;
