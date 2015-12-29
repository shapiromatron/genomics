import _ from 'underscore';
import React from 'react';

import BreadcrumbBar from '../BreadcrumbBar';
import FormFieldError from '../FormFieldError';
import urls from '../../constants/urls';
import h from '../../utils/helpers';


class Form extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.object;
        this.setDefaultFeatureList(props);
        this.state._expandedOptions = false;
    }

    componentWillReceiveProps(props){
        this.setDefaultFeatureList(props);
    }

    setDefaultFeatureList(props){
        if (props.feature_lists.length > 0 && !this.state.feature_list)
            this.state.feature_list = props.feature_lists[0].id;
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
            urls.analysis,
        ];
        if (this.state.id){
            paths.push({
                name: this.state.name,
                url: h.getObjectURL(urls.analysis.url, this.state.id),
            });
        }
        return <BreadcrumbBar paths={paths} current={current} />;
    }

    getTitle(){
        return (this.state.id) ?
            `Update ${this.state.name}` :
            'Create new analysis';
    }

    renderNonFieldErrors(errs){
        if (!errs.non_field_errors) return null;
        return (
            <div className='form-group'>
                <div className='col-sm-12 alert alert-danger has-error'>
                    <FormFieldError errors={errs.non_field_errors} />
                </div>
            </div>
        );
    }

    getFeatureListOptions(){
        return this.props.feature_lists.map(function(d){
            return <option key={d.id} value={d.id}>{d.name}</option>;
        });
    }

    getSortVectorOptions(){
        let opts = [
            <option key='' value=''>---</option>,
        ];
        let fl = parseInt(this.state.feature_list);
        let additions = this.props.sort_vectors.filter(function(d){
            return d.feature_list === fl;
        }).map(function(d){
            return <option key={d.id} value={d.id}>{d.name}</option>;
        });
        opts.push.apply(opts, additions);
        return opts;
    }

    handleOptionsExpander () {
        this.setState({_expandedOptions: !this.state._expandedOptions});
    }

    render() {
        let errs = this.props.errors || {};
        return (
            <div>
                {this.getBreadcrumbs()}
                <h2>{this.getTitle()}</h2>

                <form className='form-horizontal' onSubmit={this.handleSubmit.bind(this)}>

                    {this.renderNonFieldErrors(errs)}

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

                    <div className={h.getInputDivClass('genome_assembly', errs)}>
                        <label className='col-sm-2 control-label'>Genomic assembly</label>
                        <div className='col-sm-10'>
                            <select type='checkbox' className='form-control'
                                    name='genome_assembly'
                                    value={this.state.genome_assembly}
                                    onChange={this.handleChange.bind(this)} >
                                <option value='1'>hg19</option>
                                <option value='2'>mm9</option>
                            </select>
                            <FormFieldError errors={errs.genome_assembly} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('sort_vector', errs)}>
                        <label className='col-sm-2 control-label'>Sort vector</label>
                        <div className='col-sm-10'>
                            <select name='sort_vector' className='form-control' type='text'
                                   value={this.state.sort_vector}
                                   onChange={this.handleChange.bind(this)}>
                                {this.getSortVectorOptions()}
                            </select>
                            <FormFieldError errors={errs.sort_vector} />
                        </div>
                    </div>

                    <hr />
                    <h3>
                        Additional settings
                        <div className='pull-right'
                            title='Show/hide additional options'
                            style={{cursor: 'pointer'}} onClick={this.handleOptionsExpander.bind(this)}>
                            <i className={(this.state._expandedOptions) ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o'} ></i>
                        </div>
                    </h3>
                    <div className={(this.state._expandedOptions) ? '' : 'hidden'}>

                        <div className={h.getInputDivClass('public', errs)}>
                            <label className='col-sm-2 control-label'>Public</label>
                            <div className='col-sm-10'>
                                <input type='checkbox' name='public'
                                       checked={this.state.public}
                                       onChange={this.handleChange.bind(this)} />
                                <FormFieldError errors={errs.public} />
                            </div>
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
