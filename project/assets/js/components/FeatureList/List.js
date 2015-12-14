import React from 'react';
import { Link } from 'react-router';

import Loading from '../Loading';
import urls from '../../constants/urls';
import BreadcrumbBar from '../BreadcrumbBar';

import h from '../../utils/helpers';


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
        const url = h.getObjectURL(urls.feature_list.url, d.id);
        return (
            <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.public.toString()}</td>
                <td>{d.validated.toString()}</td>
                <td>{d.last_updated}</td>
                <td>
                    <Link
                        className='btn btn-primary'
                        to={url} >View</Link>
                    &nbsp;
                    <Link
                        className='btn btn-info'
                        to={url +'update/'}>Update</Link>
                    &nbsp;
                    <Link
                        className='btn btn-danger'
                        to={url +'delete/'}>Delete</Link>
                </td>
            </tr>
        );
    }

    render() {
        let content;
        if(this.props.objects.isFetching){
            content = <Loading />;
        } else if(this.props.objects.items.length ===0) {
            content = <p className='help-block'>No feature lists are available</p>;
        } else {
            content = this.renderObjectsTable();
        }
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} current='Feature lists' />
                <h1>Feature lists
                    <Link
                        className='pull-right btn btn-primary'
                        to={`${urls.feature_list.url}create/`}>Create new</Link>
                </h1>
                {content}
            </div>
        );
    }
}


export default FeatureListList;
