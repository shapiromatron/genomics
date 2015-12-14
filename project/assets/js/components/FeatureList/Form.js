import _ from 'underscore';
import React from 'react';

import BreadcrumbBar from '../BreadcrumbBar';
import urls from '../../constants/urls';

import { patchFeatureList } from '../../actions/FeatureList';


class UserDatasetForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getObjectState(props);
    }

    componentWillReceiveProps(props) {
        this.setState(this.getObjectState(props));
    }

    getDefaultObject () {
        return {
            id: undefined,
            name: '',
            description: '',
            public: false,
            stranded: true,
            text: '',
        };
    }

    getObject(props){
        let id = parseInt(props.params.id) || null;
        return (id) ? _.findWhere(props.objects.items, {id}) : undefined;
    }

    getObjectState(props){
        return this.getObject(props) || this.getDefaultObject();
    }

    getBreadcrumbs() {
        let d = this.state;
        let paths = [urls.dashboard, urls.feature_list];
        let name = (d.id) ? 'Update' : 'Create';
        if (d.id) paths.push({name: d.name, url: `${urls.feature_list.url}${d.id}/`});
        return <BreadcrumbBar paths={paths} current={name} />;
    }

    getTitle(){
        let d = this.state || {};
        return (d.id) ? `Update ${d.name}` : 'Create feature list';
    }

    getValue(target){
        switch(target.type){
        case 'checkbox':
            return target.checked;
        case 'text':
        case 'textarea':
        default:
            return target.value;
        }
    }

    handleChange(e){
        let obj = {};
        obj[e.target.name] = this.getValue(e.target);
        this.setState(obj);
    }

    handleSubmit(e){
        const { dispatch } = this.props;
        e.preventDefault();
        let originalObj = this.getObject(this.props);
        if (_.isUndefined(this.state.id)){
            let post = this.state;
        } else {
            let patch = this.getPatch(originalObj, this.state);
            let cb = function(){
                dispatch(pushState(null, '/dashboard/feature-lists/'));
            };
            dispatch(patchFeatureList(this.state.id, patch, cb));
        }
    }

    getPatch(originalObj, newObj){
        let patch = {};
        _.each(newObj, function(v, k){
            if (originalObj[k] !== v) patch[k] = v;
        });
        return patch;
    }

    render() {
        let breadcrumbs = this.getBreadcrumbs();
        let title = this.getTitle();
        let object = this.state;
        return (
            <div>
                {breadcrumbs}
                <h2>{title}</h2>


                <form className='form-horizontal' onSubmit={this.handleSubmit.bind(this)}>

                    <div className='form-group'>
                        <label className='col-sm-2 control-label'>Name</label>
                        <div className='col-sm-10'>
                            <input name='name' className='form-control' type='text'
                                   value={object.name}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='col-sm-2 control-label'>Description</label>
                        <div className='col-sm-10'>
                            <textarea name='description' className='form-control'
                                   value={object.description}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-group horizontal-checkbox'>
                        <label className='col-sm-2 control-label'>Public</label>
                        <div className='col-sm-10'>
                            <input type='checkbox' name='public'
                                   checked={object.public}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-group horizontal-checkbox'>
                        <label className='col-sm-2 control-label'>Stranded</label>
                        <div className='col-sm-10'>
                            <input type='checkbox' name='stranded'
                                   checked={object.stranded}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-group horizontal-checkbox'>
                        <label className='col-sm-2 control-label'>Content</label>
                        <div className='col-sm-10'>
                            <textarea name='text' className='form-control' rows='10'
                                   value={object.text}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-actions'>
                        <button className='pull-right btn btn-primary'>Save</button>
                    </div>

                </form>

            </div>
        );
    }
}


import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { bindActionCreators } from 'redux';

function selector(state) {
    return {
        objects: state.feature_list,
    };
}
function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        pushState: bindActionCreators(pushState, dispatch),
    };
}
export default connect(selector, mapDispatchToProps)(UserDatasetForm);
