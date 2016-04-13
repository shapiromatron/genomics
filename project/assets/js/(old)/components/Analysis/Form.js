import React from 'react';

import UserDatasetSelection from 'containers/Analysis/UserDatasetSelection';
import EncodeDatasetFiltering from 'containers/Analysis/EncodeDatasetFiltering';
import urls from 'constants/urls';
import h from 'utils/helpers';

import BreadcrumbBar from '../BreadcrumbBar';
import FormFieldError from '../FormFieldError';
import NonFieldError from '../NonFieldError';
import GenomeAssemblySelect from '../GenomeAssemblySelect';


class Form extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            _expandedOptions: false,
        };
    }

    handleChange(e){
        this.props.handleModelChange(e.target.name, h.getValue(e.target));
    }

    handleSubmit(e){
        e.preventDefault();
        this.props.handleSubmit();
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

    getFeatureListOptions(){
        return this.props.feature_lists
            .filter((d) => d.genome_assembly===this.props.object.genome_assembly)
            .map((d) => <option key={d.id} value={d.id}>{d.name}</option>);
    }

    getSortVectorOptions(){
        let opts = [<option key='' value=''>---</option>],
            additions = this.props.sort_vectors
                .filter((d) => d.feature_list === this.props.object.feature_list)
                .map((d) => <option key={d.id} value={d.id}>{d.name}</option>);
        opts.push.apply(opts, additions);
        return opts;
    }

    handleOptionsExpander () {
        this.setState({
            _expandedOptions: !this.state._expandedOptions,
        });
    }

    handleExecute (e) {
        const isActive = this.refs.executeBtn.getAttribute('class').indexOf('disabled')===-1;
        if (isActive){
            alert('starting...');
        }
    }

    render() {
        let obj = this.props.object,
            errs = this.props.errors || {};
        return (
            <div>
                {this.getBreadcrumbs()}
                <h2>{this.getTitle()}</h2>

                <form className='form-horizontal' onSubmit={this.handleSubmit.bind(this)}>

                    <NonFieldError errors={errs} />

                    <div className={h.getInputDivClass('name', errs)}>
                        <label className='col-sm-2 control-label'>Name</label>
                        <div className='col-sm-10'>
                            <input name='name' className='form-control' type='text'
                                   value={obj.name}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.name} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('description', errs)}>
                        <label className='col-sm-2 control-label'>Description</label>
                        <div className='col-sm-10'>
                            <textarea name='description' className='form-control'
                                   value={obj.description}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.description} />
                        </div>
                    </div>

                    <GenomeAssemblySelect
                        errors={errs}
                        value={obj.genome_assembly}
                        handleChange={this.handleChange.bind(this)} />

                    <div className={h.getInputDivClass('feature_list', errs)}>
                        <label className='col-sm-2 control-label'>Feature list</label>
                        <div className='col-sm-10'>
                            <select name='feature_list' className='form-control' type='text'
                                   value={obj.feature_list}
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
                                   value={obj.sort_vector}
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
                                       checked={obj.public}
                                       onChange={this.handleChange.bind(this)} />
                                <FormFieldError errors={errs.public} />
                            </div>
                        </div>

                        <div className={h.getInputDivClass('anchor', errs)}>
                            <label className='col-sm-2 control-label'>Anchor</label>
                            <div className='col-sm-10'>
                                <select className='form-control'
                                       name='anchor'
                                       value={obj.anchor}
                                       onChange={this.handleChange.bind(this)} >
                                    <option value="0">Start</option>
                                    <option value="1">Center</option>
                                    <option value="2">End</option>
                                </select>
                                <FormFieldError errors={errs.anchor} />
                            </div>
                        </div>

                        <div className={h.getInputDivClass('bin_start', errs)}>
                            <label className='col-sm-2 control-label'>Bin start</label>
                            <div className='col-sm-10'>
                                <input className='form-control'
                                       type='number' name='bin_start'
                                       value={obj.bin_start}
                                       onChange={this.handleChange.bind(this)} />
                                <p className='help-block'>Relative bin-start from item in feature-list.</p>
                                <FormFieldError errors={errs.bin_start} />
                            </div>
                        </div>

                        <div className={h.getInputDivClass('bin_size', errs)}>
                            <label className='col-sm-2 control-label'>Bin size</label>
                            <div className='col-sm-10'>
                                <input className='form-control'
                                       min={1}
                                       type='number' name='bin_size'
                                       value={obj.bin_size}
                                       onChange={this.handleChange.bind(this)} />
                                <p className='help-block'>Bin-size (minimum: 1)</p>
                                <FormFieldError errors={errs.bin_size} />
                            </div>
                        </div>

                        <div className={h.getInputDivClass('bin_number', errs)}>
                            <label className='col-sm-2 control-label'>Bin number</label>
                            <div className='col-sm-10'>
                                <input className='form-control'
                                       type='number' name='bin_number'
                                       min={1}
                                       max={250}
                                       value={obj.bin_number}
                                       onChange={this.handleChange.bind(this)} />
                                <p className='help-block'>Number of bins [1 - 250]</p>
                                <FormFieldError errors={errs.bin_number} />
                            </div>
                        </div>

                    </div>


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

Form.propTypes = {
    object: React.PropTypes.object.isRequired,
    feature_lists: React.PropTypes.array.isRequired,
    sort_vectors: React.PropTypes.array.isRequired,
    errors: React.PropTypes.object.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    handleModelChange: React.PropTypes.func.isRequired,
};

export default Form;
