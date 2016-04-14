import React from 'react';
import { connect } from 'react-redux';

import Component from '../components/Form';

import {genomeAssemblyChange} from '../actions';


class Container extends React.Component {

    handleGenomeAssemblyChange(value){
        this.props.dispatch(genomeAssemblyChange(parseInt(value)));
    }

    render() {
        return <Component
            isReady={this.props.isReady}
            genome_assembly_selector={this.props.genome_assembly_selector}
            handleGenomeAssemblyChange={this.handleGenomeAssemblyChange.bind(this)} />;
    }
}


function mapStateToProps(state) {
    return {
        isReady: state.startupContentReceived,
    };
}

export default connect(mapStateToProps)(Container);
