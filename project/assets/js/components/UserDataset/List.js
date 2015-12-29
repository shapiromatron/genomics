import React from 'react';
import { Link } from 'react-router';

import Loading from '../Loading';
import urls from '../../constants/urls';
import BreadcrumbBar from '../BreadcrumbBar';

import h from '../../utils/helpers';


class List extends React.Component {

    renderObjectsTable() {
        return (
            <table className="table table-condensed">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Public</th>
                        <th>Validated</th>
                        <th>Last updated</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.objects.items.map(this.renderObject.bind(this))}
                </tbody>
            </table>
        );
    }

    renderObject(d){
        const url = h.getObjectURL(urls.user_dataset.url, d.id);
        return (
            <tr key={d.id}>
                <td>
                    <Link to={url} >{d.name}</Link>
                </td>
                <td>{d.public.toString()}</td>
                <td>{d.validated.toString()}</td>
                <td>{h.datetimeFormat(d.last_updated)}</td>
            </tr>
        );
    }

    render() {
        let content;
        if(this.props.objects.isFetching){
            content = <Loading />;
        } else if(this.props.objects.items.length ===0) {
            content = <p className='help-block'>No user datasets are available</p>;
        } else {
            content = this.renderObjectsTable();
        }

        let crumbs = (!this.props.hideCrumbs) ?
             <BreadcrumbBar paths={[urls.dashboard]} current='User datasets' /> :
             null;

        return (
            <div>
                {crumbs}
                <h1>User datasets
                    <Link
                        className='pull-right btn btn-primary'
                        to={`${urls.user_dataset.url}create/`}>Create new</Link>
                </h1>
                {content}
            </div>
        );
    }
}

export default List;
