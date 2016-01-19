import React from 'react';
import { connect } from 'react-redux';

import {
    fetchEncodeOptionsIfNeeded,
} from '../../actions/Analysis';

import Loading from '../../components/Loading';
import Component from '../../components/Analysis/EncodeDatasetFiltering';


class Container extends React.Component {

    componentWillMount() {
        this.props.dispatch(fetchEncodeOptionsIfNeeded());
    }

    handleApplyFilters(filters){
        console.log(filters);
    }

    isReadyToRender(){
        return this.props.model.encodeOptions !== null;
    }

    render() {
        let model = this.props.model;
        if (!this.isReadyToRender()) return <Loading />;
        return (
            <Component
                options={model.encodeOptions}
                handleApplyFilters={this.handleApplyFilters.bind(this)}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        model: state.analysis,
    };
}
export default connect(mapStateToProps)(Container);
