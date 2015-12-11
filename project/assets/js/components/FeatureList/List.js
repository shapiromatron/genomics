import React from 'react';

import Loading from '../Loading';


class FeatureListList extends React.Component {

    renderObjectsTable() {
        return (
            <table className="table table-condensed">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Public</th>
                        <th>Validated</th>
                        <th>Last updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.objects.items.map(this.renderObject.bind(this))}
                </tbody>
            </table>
        );
    }

    renderObject(d){
        return (
            <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.public.toString()}</td>
                <td>{d.validated.toString()}</td>
                <td>{d.last_updated}</td>
                <td>
                    <button className='btn btn-primary'>View</button>
                    &nbsp;
                    <button className='btn btn-info'>Update</button>
                    &nbsp;
                    <button className='btn btn-danger'>Delete</button>
                </td>
            </tr>
        );
    }

    render() {
        let content;
        if(this.props.objects.isFetching){
            content = <Loading />;
        } else if(this.props.objects.items.length ===0) {
            content = <p>No feature lists are available</p>;
        } else {
            content = this.renderObjectsTable();
        }

        return content;
    }
}

export default FeatureListList;
