import React from 'react';
import { Link } from 'react-router';

import BreadcrumbBar from '../BreadcrumbBar';
import urls from '../../constants/urls';

import h from '../../utils/helpers';


class _Object extends React.Component {

    renderDeleteConfirmation() {
        if (!this.props.isDelete) return null;
        return (
            <div className='alert' style={{'border': '2px solid #c9302c', 'backgroundColor': '#efefef'}}>
                <form method="post" onSubmit={this.props.handleDeleteForm}>
                    <p>Are you sure you want to delete?</p>
                    <button className='btn btn-danger' type="submit">Confirm delete</button>
                    <span>&nbsp;</span>
                    <button className='btn btn-default' type='button' onClick={h.goBack}>Cancel</button>
                </form>
            </div>
        );
    }

    renderDetailRow(header, content){
        return (
            <tr>
                <th style={{width:'15%'}}>{header}</th>
                <td style={{width:'85%'}}>{content}</td>
            </tr>
        );
    }

    renderUserDatasets(){
        let datasets = this.props.object.analysis_user_datasets;
        return (
            <tr>
                <th style={{width:'15%'}}>User datasets</th>
                <td style={{width:'85%'}}>
                    <ul>
                    {datasets.map((d)=>{
                        let url = h.getObjectURL(urls.user_dataset.url, d.id);
                        return (
                            <li key={d.id}>
                                <Link to={url}>{d.display_name}</Link>
                            </li>
                        );
                    })}
                    </ul>
                </td>
            </tr>
        );
    }

    renderEncodeDatasets(){
        let datasets = this.props.object.analysis_encode_datasets;
        return (
            <tr>
                <th style={{width:'15%'}}>ENCODE datasets</th>
                <td style={{width:'85%'}}>
                    <ul>
                    {datasets.map((d) =>
                        <li key={d.dataset}>{d.display_name}</li>
                    )}
                    </ul>
                </td>
            </tr>
        );
    }

    render() {
        let object = this.props.object;
        const url = h.getObjectURL(urls.analysis.url, object.id);
        return (
            <div>
                <BreadcrumbBar
                    paths={[urls.dashboard, urls.analysis]}
                    current={object.name} />

                <h2>

                    <span>{object.name}</span>

                    <div className='dropdown pull-right'>
                      <button className='btn btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>
                        Actions <span className="caret"></span>
                      </button>
                      <ul className='dropdown-menu'>
                        <li><Link to={url +'update/'}>Update</Link></li>
                        <li><Link to={url +'delete/'}>Delete</Link></li>
                      </ul>
                    </div>

                </h2>

                <table className='table table-condensed' style={{tableLayout: 'fixed'}}>
                    <tbody>
                        {this.renderDetailRow('Anchor', object.anchor_display)}
                        {this.renderDetailRow('Bin start', object.bin_start)}
                        {this.renderDetailRow('Bin size', object.bin_size)}
                        {this.renderDetailRow('Bin number', object.bin_number)}
                        {this.renderDetailRow('Description', object.description)}
                        {this.renderDetailRow('Public', h.booleanCheckbox(object.public))}
                        {this.renderDetailRow('Validated', h.booleanCheckbox(object.validated))}
                        {this.renderDetailRow('Genome assembly', object.genome_assembly_display)}
                        {this.renderDetailRow('Date created', h.datetimeFormat(object.created))}
                        {this.renderDetailRow('Date updated', h.datetimeFormat(object.last_updated))}
                        {this.renderUserDatasets()}
                        {this.renderEncodeDatasets()}
                    </tbody>
                </table>
                {this.renderDeleteConfirmation()}
            </div>
        );
    }
}

export default _Object;
