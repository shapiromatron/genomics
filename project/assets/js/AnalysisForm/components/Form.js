import React from 'react';

import UserDatasetSelection from '../containers/UserDatasetSelection';
import EncodeDatasetSelection from '../containers/EncodeDatasetSelection';

import Loading from './Loading';


class Component extends React.Component {

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
};

export default Component;
