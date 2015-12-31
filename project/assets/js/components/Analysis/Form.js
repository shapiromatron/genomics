import _ from 'underscore';
import React from 'react';

import BreadcrumbBar from '../BreadcrumbBar';
import FormFieldError from '../FormFieldError';
import GenomeAssemblySelect from '../GenomeAssemblySelect';
import UserDatasetFormRow from './UserDatasetFormRow';
import EncodeDatasetFiltering from './EncodeDatasetFiltering';
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
        return this.props.feature_lists
            .filter((d) => d.genome_assembly===this.state.genome_assembly)
            .map((d) => <option key={d.id} value={d.id}>{d.name}</option>);
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

    handleExecute (e) {
        const isActive =this.refs.executeBtn.getAttribute('class').indexOf('disabled')===-1;
        if (isActive){
            alert('starting...');
        }
    }

    handleUserDatasetChange (include, dataset_id, display_name) {
        let obj = _.findWhere(this.state.datasets, {dataset: dataset_id});
        if (obj){
            if (include){
                obj.display_name = display_name;
            } else {
                this.state.datasets.pop(_.indexOf(this.state.datasets, obj));
            }
        } else {
            this.state.datasets.push({
                dataset: dataset_id,
                display_name: display_name,
            });
        }
    }

    renderUserDatasets () {

        let allDatasets = _.chain(this.props.user_datasets)
            .filter((d) => d.genome_assembly === this.state.genome_assembly)
            .value();
        let selected = _.indexBy(this.state.datasets, (d) => d.dataset);

        return (
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Include? Dataset short-name</th>
                        <th>Name</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                {
                    allDatasets.map((d) => {
                        return <UserDatasetFormRow
                            key={d.id}
                            object={d}
                            initial={selected[d.id] || null}
                            handleChange={this.handleUserDatasetChange.bind(this)} />;
                    })
                }
                </tbody>
            </table>
        );
    }

    renderEncodeDataSelection () {
        return (
            <EncodeDatasetFiltering
                options={this.props.encode_options} />
        );
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

                    <GenomeAssemblySelect
                        errors={errs}
                        value={this.state.genome_assembly}
                        handleChange={this.handleChange.bind(this)} />

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

                    <hr />
                    <h3>User-uploaded genome datasets </h3>
                    {this.renderUserDatasets()}

                    <hr />
                    <h3>ENCODE data selection</h3>
                    {this.renderEncodeDataSelection()}

                    <hr />
                    <div className='form-actions'>
                        <div className='pull-right'>
                            <button className='btn btn-default' type='button' onClick={h.goBack}>Cancel</button>
                            <span>&nbsp;</span>
                            <button className='btn btn-primary'>Validate</button>
                            <span>&nbsp;</span>
                            <button ref='executeBtn'
                                type='button'
                                onClick={this.handleExecute.bind(this)}
                                className='btn btn-success disabled'>Execute</button>
                        </div>
                    </div>

                </form>

            </div>
        );
    }
}

export default Form;
