import React from 'react';

import FormFieldError from './FormFieldError';


class NonFieldError extends React.Component {

    render() {
        if (!this.props.errors.non_field_errors) return null;
        return (
            <div className='form-group'>
                <div className='col-sm-12 alert alert-danger has-error'>
                    <FormFieldError errors={this.props.errors.non_field_errors} />
                </div>
            </div>
        );
    }
}

NonFieldError.propTypes = {
    errors: React.PropTypes.object,
};

export default NonFieldError;
