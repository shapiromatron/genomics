import React from 'react';
import { Link } from 'react-router';

import Loading from '../Loading';
import urls from '../../constants/urls';
import BreadcrumbBar from '../BreadcrumbBar';

import h from '../../utils/helpers';


class List extends React.Component {

    renderObjectsTable() {
        let objects = this.getObjects();
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
                    {objects.map(this.renderObject.bind(this))}
                </tbody>
            </table>
        );
    }

    renderObject(d){
        const url = h.getObjectURL(urls.sort_vector.url, d.id);
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

    getObjects(){
        let objects = this.props.objects.items,
            parent_id = this.props.parent_id;
        if (parent_id)
            objects = objects.filter(function(d){
                return d.feature_list === parent_id;
            });
        return objects;
    }

    getBreadcrumbs() {
        if (this.props.parent_id || this.props.hideCrumbs) return null;
        let paths = [urls.dashboard];
        return <BreadcrumbBar paths={paths} current={urls.sort_vector.name} />;
    }

    render() {
        let content,
            objects = this.getObjects(),
            create_args = (this.props.parent_id) ? `?parent_id=${this.props.parent_id}` : '';

        if(this.props.objects.isFetching){
            content = <Loading />;
        } else if(objects.length ===0) {
            content = <p className='help-block'>No sort vectors have been created.</p>;
        } else {
            content = this.renderObjectsTable();
        }

        return (
            <div>
                {this.getBreadcrumbs()}
                <h2>Sort vectors
                    <Link
                        className='pull-right btn btn-primary'
                        to={`${urls.sort_vector.url}create/${create_args}`}>Create new</Link>
                </h2>
                {content}
            </div>
        );
    }
}

export default List;
