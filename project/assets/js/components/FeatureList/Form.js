import React from 'react';

import BreadcrumbBar from '../BreadcrumbBar';
import urls from '../../constants/urls';
import h from '../../utils/helpers';


class FeatureListForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.object || this.getDefaultObject();
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
            urls.feature_list,
        ];
        if (this.state.id){
            paths.push({
                name: this.state.name,
                url: h.getObjectURL(urls.feature_list.url, this.state.id),
            });
        }
        return <BreadcrumbBar paths={paths} current={current} />;
    }

    getTitle(){
        return (this.state.id) ?
            `Update ${this.state.name}` :
            'Create feature list';
    }

    render() {
        return (
            <div>
                {this.getBreadcrumbs()}
                <h2>{this.getTitle()}</h2>

                <form className='form-horizontal' onSubmit={this.handleSubmit.bind(this)}>

                    <div className='form-group'>
                        <label className='col-sm-2 control-label'>Name</label>
                        <div className='col-sm-10'>
                            <input name='name' className='form-control' type='text'
                                   value={this.state.name}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='col-sm-2 control-label'>Description</label>
                        <div className='col-sm-10'>
                            <textarea name='description' className='form-control'
                                   value={this.state.description}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-group horizontal-checkbox'>
                        <label className='col-sm-2 control-label'>Public</label>
                        <div className='col-sm-10'>
                            <input type='checkbox' name='public'
                                   checked={this.state.public}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-group horizontal-checkbox'>
                        <label className='col-sm-2 control-label'>Stranded</label>
                        <div className='col-sm-10'>
                            <input type='checkbox' name='stranded'
                                   checked={this.state.stranded}
                                   onChange={this.handleChange.bind(this)} />
                        </div>
                    </div>

                    <div className='form-group horizontal-checkbox'>
                        <label className='col-sm-2 control-label'>Content</label>
                        <div className='col-sm-10'>
                            <textarea name='text' className='form-control' rows='10'
                                   value={this.state.text}
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

export default FeatureListForm;
