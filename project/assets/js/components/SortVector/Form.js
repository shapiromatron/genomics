import React from 'react';

import BreadcrumbBar from '../BreadcrumbBar';
import FormFieldError from '../FormFieldError';
import NonFieldError from '../NonFieldError';
import urls from '../../constants/urls';
import h from '../../utils/helpers';


class Form extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.object;
        if (props.parent_id) this.state.feature_list = props.parent_id;
    }

    handleChange(e){
        let obj = {};
        obj[e.target.name] = h.getValue(e.target);
        this.setState(obj);
    }

    handleSubmit(e){
        e.preventDefault();
        this.props.handleSubmit(this.state);
    }

    getBreadcrumbs() {
        let current = (this.state.id) ? 'Update' : 'Create';
        let paths = [
            urls.dashboard,
            urls.sort_vector,
        ];
        if (this.state.id){
            paths.push({
                name: this.state.name,
                url: h.getObjectURL(urls.sort_vector.url, this.state.id),
            });
        } else if (this.props.parent_id){
            paths.push({
                name: 'Feature list',
                url: h.getObjectURL(urls.feature_list.url, this.props.parent_id),
            });
        }
        return <BreadcrumbBar paths={paths} current={current} />;
    }

    getTitle(){
        return (this.state.id) ?
            `Update ${this.state.name}` :
            'Add sort vector';
    }

    getFeatureListOptions(){
        return this.props.feature_lists.map(function(d){
            return <option key={d.id} value={d.id}>{d.name}</option>;
        });
    }

    render() {
        let errs = this.props.errors || {};
        return (
            <div>
                {this.getBreadcrumbs()}
                <h2>{this.getTitle()}</h2>

                <form className='form-horizontal' onSubmit={this.handleSubmit.bind(this)}>

                    <NonFieldError errors={errs} />

                    <div className={h.getInputDivClass('feature_list', errs)}>
                        <label className='col-sm-2 control-label'>Feature list</label>
                        <div className='col-sm-10'>
                            <select name='feature_list' className='form-control' type='text'
                                   value={this.state.feature_list}
                                   onChange={this.handleChange.bind(this)}>
                                {this.getFeatureListOptions()}
                            </select>
                            <FormFieldError errors={errs.feature_list} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('name', errs)}>
                        <label className='col-sm-2 control-label'>Name</label>
                        <div className='col-sm-10'>
                            <input name='name' className='form-control' type='text'
                                   value={this.state.name}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.name} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('description', errs)}>
                        <label className='col-sm-2 control-label'>Description</label>
                        <div className='col-sm-10'>
                            <textarea name='description' className='form-control'
                                   value={this.state.description}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.description} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('public', errs)}>
                        <label className='col-sm-2 control-label'>Public</label>
                        <div className='col-sm-10'>
                            <input type='checkbox' name='public'
                                   checked={this.state.public}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.public} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('text', errs)}>
                        <label className='col-sm-2 control-label'>Content</label>
                        <div className='col-sm-10'>
                            <textarea name='text' className='form-control' rows='10'
                                   value={this.state.text}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.text} />
                        </div>
                    </div>

                    <div className='form-actions'>
                        <div className='pull-right'>
                            <button className='btn btn-default' type='button' onClick={h.goBack}>Cancel</button>
                            <span>&nbsp;</span>
                            <button className='btn btn-primary'>Save</button>
                        </div>
                    </div>

                </form>

            </div>
        );
    }
}

export default Form;
