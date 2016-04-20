import React from 'react';
import $ from 'jquery';

import UserDatasetSelection from '../containers/UserDatasetSelection';
import EncodeDatasetSelection from '../containers/EncodeDatasetSelection';
import DatasetInput from './DatasetInput';

import Loading from './Loading';


class Component extends React.Component {

    componentWillMount(){
        $(this.props.genome_assembly_selector).change((e)=>{
            this.props.handleGenomeAssemblyChange(e.target.value);
        }).trigger('change');
    }

    render(){
        if (!this.props.isReady) return <Loading />;

        return (
            <div>
                <h3>User-uploaded genome datasets </h3>
                <UserDatasetSelection />

                <hr />
                <h3>ENCODE data selection</h3>
                <EncodeDatasetSelection />

                <DatasetInput
                    userDatasetsSelected={this.props.userDatasetsSelected}
                    encodeSelected={this.props.encodeSelected}
                    datasets_json_selector={this.props.datasets_json_selector}/>
            </div>
        );
    }
}

Component.propTypes = {
    isReady: React.PropTypes.bool.isRequired,
    genome_assembly_selector: React.PropTypes.string.isRequired,
    datasets_json_selector: React.PropTypes.string.isRequired,
    handleGenomeAssemblyChange: React.PropTypes.func.isRequired,
    userDatasetsSelected: React.PropTypes.array.isRequired,
    encodeSelected: React.PropTypes.array.isRequired,
};

export default Component;
