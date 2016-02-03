import React from 'react';
import { Link } from 'react-router';

import urls from 'constants/urls';
import h from 'utils/helpers';


class RunningTable extends React.Component {

    render() {
        if (this.props.objects.length ===0)
            return <p className='help-block'>You have no analyses currently running.</p>;

        return (
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date started</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.objects.map(function(d){
                        let url = h.getObjectURL(urls.analysis.url, d.id);
                        return (
                            <tr key={d.id}>
                                <td>{d.name}</td>
                                <td>{d.start_time}</td>
                                <td>
                                    <Link to={url}>View</Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

}

RunningTable.propTypes = {
    objects: React.PropTypes.array,
};

export default RunningTable;
