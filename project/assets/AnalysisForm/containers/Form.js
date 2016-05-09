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
            datasets_json_selector={this.props.datasets_json_selector}
            handleGenomeAssemblyChange={this.handleGenomeAssemblyChange.bind(this)}
            userDatasetsSelected={this.props.userDatasetsSelected}
            encodeSelected={this.props.encodeSelected}
            />;
    }
}


function mapStateToProps(state) {
    return {
        isReady: state.startupContentReceived,
        userDatasetsSelected: state.userDatasetsSelected,
        encodeSelected: state.encodeSelected,
    };
}

export default connect(mapStateToProps)(Container);
