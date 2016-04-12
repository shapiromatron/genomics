import React from 'react';
import { Link } from 'react-router';


class BreadCrumbBar extends React.Component {

    render() {
        const current =  (this.props.current) ?
            <li className="active">{this.props.current}</li> :
            null;

        return (
            <ol className="breadcrumb">
                {this.props.paths.map(function(p){
                    return <li key={p.name}><Link to={p.url}>{p.name}</Link></li>;
                })}
                {current}
            </ol>
        );
    }
}

BreadCrumbBar.propTypes = {
    current: React.PropTypes.string,
    paths: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

export default BreadCrumbBar;
