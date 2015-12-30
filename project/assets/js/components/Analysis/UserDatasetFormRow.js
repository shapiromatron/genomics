import React from 'react';
import { Link } from 'react-router';

import urls from '../../constants/urls';
import h from '../../utils/helpers';


class UserDatasetFormRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = (props.initial) ?
            Object.assign({}, props.initial, {selected: true})
        : {
            selected: false,
            dataset: props.object.id,
            display_name: props.object.name,
        };
    }

    handleChange (e) {
        if(e.target === this.refs.checkBox)
            this.setState({selected: e.target.checked});

        if(e.target === this.refs.displayName)
            this.setState({display_name: e.target.value});

        this.props.handleChange(
            this.refs.checkBox.checked,
            this.props.object.id,
            this.refs.displayName.value
        );
    }

    render () {
        let d = this.props.object,
            url = h.getObjectURL(urls.user_dataset.url, d.id);
        return (
            <tr>
                <td style={{width:'30%'}}>
                    <div className='input-group'>
                        <span className='input-group-addon'>
                            <input
                                ref='checkBox'
                                type='checkbox'
                                checked={this.state.selected}
                                onChange={this.handleChange.bind(this)}/>
                        </span>
                        <input
                            ref='displayName'
                            type='text'
                            value={this.state.display_name}
                            onChange={this.handleChange.bind(this)}
                            className='form-control' />
                    </div>
                </td>
                <td style={{width:'25%'}}>
                    <Link to={url}>{d.name}</Link>
                </td>
                <td style={{width:'45%'}}>
                    {d.description}
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
