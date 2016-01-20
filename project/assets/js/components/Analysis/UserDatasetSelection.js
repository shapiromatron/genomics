import _ from 'underscore';
import React from 'react';

import UserDatasetFormRow from './UserDatasetFormRow';


class UserDatasetSelection extends React.Component {

    render() {

        let allDatasets = _.chain(this.props.user_datasets)
            .filter((d) => d.genome_assembly === this.props.genome_assembly)
            .value();
        let selected = _.indexBy(this.props.analysis_user_datasets, (d) => d.dataset);

        return (
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Include? Dataset short-name</th>
                        <th>Name</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                {
                    allDatasets.map((d) => {
                        return <UserDatasetFormRow
                            key={d.id}
                            object={d}
                            initial={selected[d.id] || null}
                            handleChange={this.props.handleUserDatasetChange} />;
                    })
                }
                </tbody>
            </table>
        );
    }
}

export default UserDatasetSelection;

UserDatasetSelection.propTypes = {
    user_datasets: React.PropTypes.array.isRequired,
    genome_assembly: React.PropTypes.number.isRequired,
    analysis_user_datasets: React.PropTypes.array.isRequired,
    handleUserDatasetChange: React.PropTypes.func.isRequired,
};

export default UserDatasetSelection;
