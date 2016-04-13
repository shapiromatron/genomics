import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import Component from '../components/UserDatasetSelection';


class Container extends React.Component {

    handleUserDatasetChange (includes, removes) {
        console.log('to fix');
        // let selected = _.indexBy(this.props.object.analysis_user_datasets, 'dataset');
        // if(includes){
        //     selected[includes.dataset] = includes;
        // }
        // if(removes){
        //     delete selected[removes];
        // }
        // this.props.dispatch(changeEditObject('analysis_user_datasets', _.values(selected)));
    }


    render() {
        return (
            <Component
                allDatasets={_.values(this.props.userDatasets)}
                selectedDatasets={[]} // to fix
                genome_assembly={1} // to fix
                handleUserDatasetChange={this.handleUserDatasetChange.bind(this)}/>
        );
    }
}

function mapStateToProps(state) {
    return {
        userDatasets: state.userDatasets,
    };
}
export default connect(mapStateToProps)(Container);
