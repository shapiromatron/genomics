import React from 'react';
import $ from 'jquery';

import UserDatasetSelection from '../containers/UserDatasetSelection';
import EncodeDatasetSelection from '../containers/EncodeDatasetSelection';

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
            </div>
        );
    }
}

Component.propTypes = {
    isReady: React.PropTypes.bool.isRequired,
    genome_assembly_selector: React.PropTypes.string.isRequired,
    handleGenomeAssemblyChange: React.PropTypes.func.isRequired,
};

export default Component;
