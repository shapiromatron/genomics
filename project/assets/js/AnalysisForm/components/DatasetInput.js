import React from 'react';

import $ from 'jquery';


class Component extends React.Component {

    render () {
        // get new text to render
        let json = JSON.stringify({
            userDatasets: this.props.userDatasetsSelected,
            encodeDatasets: this.props.encodeSelected,
        });

        // apply to django-managed field
        $(this.props.datasets_json_selector).html(json);

        // apply to this field to ensure DOM propagation
        return (
            <span className='hidden'>{json}</span>
        );
    }
}

Component.propTypes = {
    userDatasetsSelected: React.PropTypes.array.isRequired,
    encodeSelected: React.PropTypes.array.isRequired,
    datasets_json_selector: React.PropTypes.string.isRequired,
};

export default Component;
