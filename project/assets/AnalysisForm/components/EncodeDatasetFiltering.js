import _ from 'underscore';
import $ from 'jquery';
import React from 'react';

import h from 'utils/helpers';

import EncodeFilterSelect from './EncodeFilterSelect';


class EncodeDatasetFiltering extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filters: {},
            numSelected: 0,
            numIncludedSelected: 0,
            popupVisible: false,
            popupItem: null,
        };
    }

    getEncodeDataFormats($els){
        return $els.map((i, el) => {
            return {
                dataset: parseInt(el.value),
                display_name: el.textContent,
            };
        }).get();
    }

    handleAddSelected(){
        let additions = this.getEncodeDataFormats(
            $(this.refs.available).find('option:selected'));
        this.props.handleSelectionChange(additions, null);
    }

    handleAddAll(){
        let additions = this.getEncodeDataFormats(
            $(this.refs.available).children());
        this.props.handleSelectionChange(additions, null);
    }

    handleRemoveSelected(){
        let removals = this.getEncodeDataFormats(
            $(this.refs.selected).find('option:selected'));
        this.props.handleSelectionChange(null, removals);
        this.setState({numIncludedSelected: 0});
    }

    handleRemoveAll(){
        let removals = this.getEncodeDataFormats(
            $(this.refs.selected).children());
        this.props.handleSelectionChange(null, removals);
        this.setState({numIncludedSelected: 0});
    }

    handleApplyFilters(){
        let filters = _.pick(h.deepCopy(this.state.filters), _.identity); // remove null
        this.props.handleApplyFilters(filters);
    }

    handleFilterChange(e){
        let obj = this.state.filters;
        obj[e.target.name] = $(e.target).val();
        this.setState(obj);
    }

    handleAvailableSelectedChange(e){
        let vals = $(e.target).val(),
            count = (vals) ? vals.length: 0;
        this.setState({numSelected: count});
    }

    handleIncludedSelectedChange(e){
        let vals = $(e.target).val(),
            count = (vals) ? vals.length: 0;
        this.setState({numIncludedSelected: count});
    }

    handleDatasetMouseOver(e) {
        let object = this.props.availableDatasets[parseInt(e.target.value)];
        let loc = e.target.getBoundingClientRect();
        this.setState({
            popupVisible: true,
            popupItem: {
                x: window.scrollX + loc.right,
                y: window.scrollY + loc.top - 5,
                object: object,
            },
        });
    }

    handleDatasetMouseOut(e) {
        this.setState({
            popupVisible: false,
            popupItem: null,
        });
    }

    render() {
        let opts = this.props.options[this.props.genome_assembly],
            vals = this.state.filters;

        return (
            <div>
            {this.renderDatasetDetailPopup()}
            <div className='row'>
                <div className='col-md-12'>
                    <button type='button'
                            onClick={this.handleApplyFilters.bind(this)}
                            className='btn btn-primary pull-right'>
                            <i className='fa fa-filter'></i> Apply filters</button>
                    <p className='help-block'>
                        There are thousands of ENCODE datasets available for
                        comparing your dataest. Please select from the list of
                        filters below, then press filter to select a subset of
                        available ENCODE data. The, datasets of interest to your
                        project.
                    </p>
                </div>
            </div>
            <div className='row'>
                <EncodeFilterSelect
                    label='Data type'
                    name='data_type'
                    initiallyVisible={true}
                    options={opts.data_type}
                    values={vals.data_type || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Cell type'
                    name='cell_type'
                    initiallyVisible={true}
                    options={opts.cell_type}
                    values={vals.cell_type || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Treatment'
                    name='treatment'
                    initiallyVisible={true}
                    options={opts.treatment}
                    values={vals.treatment || []}
                    handleChange={this.handleFilterChange.bind(this)} />
            </div>
            <div className='row'>
                <EncodeFilterSelect
                    label='Antibody'
                    name='antibody'
                    initiallyVisible={false}
                    options={opts.antibody}
                    values={vals.antibody || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='Phase'
                    name='phase'
                    initiallyVisible={false}
                    options={opts.phase}
                    values={vals.phase || []}
                    handleChange={this.handleFilterChange.bind(this)} />

                <EncodeFilterSelect
                    label='RNA extract'
                    name='rna_extract'
                    initiallyVisible={false}
                    options={opts.rna_extract}
                    values={[]}
                    handleChange={this.handleFilterChange.bind(this)} />

            </div>
            <div className='row'>
                {this.renderAvailableDatasets()}
                <div className='col-md-2 text-center'>
                    <h4>&nbsp;</h4>
                    <button style={{marginTop: '1em'}}
                            type='button'
                            onClick={this.handleAddAll.bind(this)}
                            className='btn btn-default'>
                        Add all <i className='fa fa-angle-double-right'></i></button>
                    <br></br>
                    <button type='button'
                            onClick={this.handleAddSelected.bind(this)}
                            className='btn btn-default'>
                        Add <i className='fa fa-angle-right'></i></button>
                    <br></br>
                    <br></br>
                    <button type='button'
                            onClick={this.handleRemoveSelected.bind(this)}
                            className='btn btn-default'>
                        <i className='fa fa-angle-left'></i> Remove</button>
                    <br></br>
                    <button type='button'
                            onClick={this.handleRemoveAll.bind(this)}
                            className='btn btn-default'>
                        <i className='fa fa-angle-double-left'></i> Remove all</button>
                    <br></br>

                </div>
                {this.renderIncludedDatasets()}
            </div>
            </div>
        );
    }

    renderAvailableDatasets(){
        let datasets = _.values(this.props.availableDatasets);
        return (
            <div className='col-md-5'>
                <h4>Available datasets (after filtering)</h4>
                <select
                    onChange={this.handleAvailableSelectedChange.bind(this)}
                    onMouseOut={this.handleDatasetMouseOut.bind(this)}
                    ref='available'
                    size='10'
                    className='form-control encodeDatasetSelect' multiple={true}>
                    {datasets.map(this.renderDatsetOption.bind(this))}
                </select>
                <p><strong>Available:</strong> <span>{datasets.length}</span></p>
                <p><strong>Selected:</strong> <span>{this.state.numSelected}</span></p>
            </div>
        );
    }

    renderIncludedDatasets(){
        let selected = this.props.selectedDatasets;
        return (
            <div className='col-md-5'>
                <h4>Included datasets</h4>
                <select
                    onChange={this.handleIncludedSelectedChange.bind(this)}
                    size='10'
                    ref='selected'
                    className='form-control' multiple={true}>
                    {selected.map(this.renderSelectedOption)}
                </select>
                <p><strong>Included:</strong> <span>{selected.length}</span></p>
                <p><strong>Selected:</strong> <span>{this.state.numIncludedSelected}</span></p>
            </div>
        );
    }

    renderSelectedOption(d){
        return <option key={d.dataset} value={d.dataset}>{d.display_name}</option>;
    }

    renderDatsetOption(d){
        return <option
            onMouseOver={this.handleDatasetMouseOver.bind(this)}
            key={d.id}
            value={d.id}>{d.name}</option>;
    }

    renderDatasetDetailPopup(){
        if (!this.state.popupVisible) return null;
        let item = this.state.popupItem,
            object = item.object;
        return (
            <div
                className="popover right datasetPopover"
                style={{top: `${item.y}px`, left: `${item.x}px`, display: 'block'}}>
                <div className="arrow"
                    style={{top: '13px'}}></div>
                <h3 className="popover-title">{object.name}</h3>
                <div className="popover-content">
                    <table className='table table-condensed table-hover'>
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Data type</td><td>{object.data_type}</td></tr>
                            <tr><td>Cell type</td><td>{object.cell_type}</td></tr>
                            <tr><td>Treatment</td><td>{object.treatment}</td></tr>
                            <tr><td>Antibody</td><td>{object.antibody}</td></tr>
                            <tr><td>Phase</td><td>{object.phase}</td></tr>
                            <tr><td>RNA extract</td><td>{object.rna_extract}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

EncodeDatasetFiltering.propTypes = {
    genome_assembly: React.PropTypes.number.isRequired,
    options: React.PropTypes.object.isRequired,
    handleApplyFilters: React.PropTypes.func.isRequired,
    availableDatasets: React.PropTypes.object.isRequired,
    handleSelectionChange: React.PropTypes.func.isRequired,
    selectedDatasets: React.PropTypes.array.isRequired,
};

export default EncodeDatasetFiltering;
