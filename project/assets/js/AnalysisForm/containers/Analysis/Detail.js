import $ from 'jquery';
import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import { execute } from 'actions/Analysis';
import Loading from 'components/Loading';
import Component from 'components/Analysis/Object';


class Container extends React.Component {

    getObject(){
        return _.findWhere(
            this.props.objects.items,
            {id: parseInt(this.props.params.id)}
        );
    }

    handleExecute(){
        const { dispatch } = this.props,
            obj = this.getObject();
        dispatch(execute(obj.url_execute));
    }

    render() {
        let object = this.getObject();
        if (_.isUndefined(object)) return <Loading />;
        return (
            <Component object={object}
                isDelete={false}
                handleDeleteForm={null}
                handleExecute={this.handleExecute.bind(this)} />
        );
    }
}

function mapStateToProps(state) {
    return {
        objects: state.analysis,
    };
}
export default connect(mapStateToProps)(Container);
