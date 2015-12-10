import React from 'react';
import { Link } from 'react-router';

import urls from '../constants/urls';


class BreadCrumbBar extends React.Component {

    render() {
        return (
            <ol className="breadcrumb">
                <li><a href="/">Home</a></li>
                {this.props.paths.map(function(p){
                    return <li><Link to={p.url}>{p.name}</Link></li>;
                })}
                <li className="active">{this.props.current}</li>
            </ol>
        );
    }
}

export default BreadCrumbBar;
