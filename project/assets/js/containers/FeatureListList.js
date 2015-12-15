import React from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

import FL from '../components/FeatureList/List.js';


class FeatureListList extends React.Component {

    render() {
        return (
            <div>
                <FL objects={this.props.objects}/>
            </div>
        );
    }
}

export default connect(
  state => ({objects: state.feature_list}),
  { pushState }
)(FeatureListList);
