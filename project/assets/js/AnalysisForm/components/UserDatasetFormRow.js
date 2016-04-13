import React from 'react';


class UserDatasetFormRow extends React.Component {

    handleChange (e) {
        let includes = null,
            removes = null;
        if(this.refs.checkBox.checked){
            includes = {
                dataset: this.props.object.id,
                display_name: this.refs.displayName.value,
            };
        } else {
            removes = this.props.object.id;
        }
        this.props.handleChange(includes, removes);
    }

    getFormProps (object) {
        return (this.props.initial)? this.props.initial: {
            dataset: false,
            display_name: object.name,
        };
    }

    render () {
        let object = this.props.object,
            formValues = this.getFormProps(object),
            showInput = (formValues.dataset) ? 1 : 0.7;
        return (
            <tr>
                <td style={{width:'30%'}}>
                    <div className='input-group'>
                        <span className='input-group-addon'>
                            <input
                                ref='checkBox'
                                type='checkbox'
                                checked={formValues.dataset}
                                onChange={this.handleChange.bind(this)}/>
                        </span>
                        <input
                            style={{opacity: showInput}}
                            ref='displayName'
                            type='text'
                            value={formValues.display_name}
                            onChange={this.handleChange.bind(this)}
                            className='form-control' />
                    </div>
                </td>
                <td style={{width:'25%'}}>
                    <a href={object.url}>{object.name}</a>
                </td>
                <td style={{width:'45%'}}>
                    {object.description}
                </td>
            </tr>
        );
    }

}

UserDatasetFormRow.propTypes = {
    initial: React.PropTypes.object,
    object: React.PropTypes.object.isRequired,
    handleChange: React.PropTypes.func.isRequired,
};

export default UserDatasetFormRow;
