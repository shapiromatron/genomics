import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';

import ScatterplotModal from './ScatterplotModal';
import SortVectorScatterplotModal from './SortVectorScatterplotModal';


class AnalysisOverview{

    constructor(el, data) {
        this.el = el;
        this.dendrogram = data['dendrogram'];
        this.cluster_members = data['cluster_members'];
        this.cluster_display = data['max_abs_correlation_values'];
        this.correlation_matrix = data['correlation_matrix'];
        this.matrix_names = data['matrix_names'];
        this.cluster_medoids = data['cluster_medoids'];
        this.matrix_ids = data['matrix_ids'];
        this.matrix = _.object(data['matrix_ids'], data['matrix_names']);
        this.sort_vector = data['sort_vector'];
        this.bin_parameters = data['bin_parameters'];

        var matrix = this.matrix,
            cluster_medoids = this.cluster_medoids;
        if (this.sort_vector) {
            this.col_names = [];
            var start = parseInt(this.bin_parameters['window_start']),
                step = parseInt(this.bin_parameters['bin_size']);

            for (var i = 0; i < parseInt(this.bin_parameters['bin_number']); i++) {
                this.col_names.push((start + step*i) + ':' + (start + step*(i+1) - 1));
            }
        } else {
            this.col_names = _.map(this.cluster_members, function(d, i){
                let name = (d.length > 1)?
                        `(${d.length}) ${cluster_medoids[i]}`:
                        matrix[cluster_medoids[i]];

                return name;
            });
        }
    }

    drawHeatmap() {
        // remove existing heatmap
        this.el.find('#heatmap').remove();

        // create heatmap
        var heatmap = $('<div id="heatmap">')
            .css({
                'height': '80%',
                'width': '60%',
                'position': 'absolute',
                'left': '40%',
                'top': '20%',
            }).appendTo(this.el);

        if (this.sort_vector) {
            var height = heatmap.height(),
            width = heatmap.width(),
            col_number = this.cluster_display[0].length,
            row_number = this.cluster_display.length,
            cell_height = height/row_number,
            cell_width = width/col_number,
            cluster_members = this.cluster_members,
            cluster_medoids = this.cluster_medoids,
            matrix_names = this.matrix_names,
            col_names = this.col_names,
            matrix = this.matrix,
            sort_vector = this.sort_vector,
            getIndex = function(idx){
                return (cluster_members[idx].length === 1) ?
                    cluster_members[idx][0] :
                    `(${cluster_members[idx].length}) ${cluster_medoids[idx]}`;
            },
            showTooltip = function (d, i, j) {
                d3.select(this)
                    .style('stroke', 'black')
                    .style('stroke-width', '1');

                var idy = getIndex(j);

                $(this).tooltip({
                    container: 'body',
                    title: `${matrix[idy]}<br/>${col_names[i]}<br/>${d.toFixed(2)}`,
                    html: true,
                    animation: false,
                }).tooltip('show');

            },
            hideTooltip = function () {
                $(this)
                    .tooltip('destroy');
                d3.select(this)
                    .style('stroke', 'none');
            },
            showScatterplot = function(d, i, j){

                var idy = getIndex(j),
                    modalTitle = $('#ind_heatmap_modal_title'),
                    modalBody = $('#ind_heatmap_modal_body');

                $('#flcModal')
                    .one('show.bs.modal', function(){
                        modalTitle.html('');
                        modalBody.html('');
                    })
                    .one('shown.bs.modal', function(){
                        var modal = new SortVectorScatterplotModal(
                            sort_vector, idy,
                            matrix[idy],
                            modalTitle, modalBody
                        );
                        modal.render();
                    }).modal('show');
            },
            colorScale = d3.scale.linear()
                .domain([-1, 0, 1])
                .range(['blue', 'white', 'red']);
        } else {
            var height = heatmap.height(),
            width = heatmap.width(),
            col_number = this.cluster_display[0].length,
            row_number = this.cluster_display.length,
            cell_height = height/row_number,
            cell_width = width/col_number,
            cluster_members = this.cluster_members,
            cluster_medoids = this.cluster_medoids,
            matrix = this.matrix,
            getIndex = function(idx){
                return (cluster_members[idx].length === 1) ?
                    cluster_members[idx][0] :
                    `(${cluster_members[idx].length}) ${cluster_medoids[idx]}`;
            },
            showTooltip = function (d, i, j) {
                d3.select(this)
                    .style('stroke', 'black')
                    .style('stroke-width', '1');

                var idx = getIndex(i),
                    idy = getIndex(j);

                $(this).tooltip({
                    container: 'body',
                    title: `${matrix[idx]}<br/>${matrix[idy]}<br/>${d.toFixed(2)}`,
                    html: true,
                    animation: false,
                }).tooltip('show');

            },
            hideTooltip = function () {
                $(this)
                    .tooltip('destroy');
                d3.select(this)
                    .style('stroke', 'none');
            },
            showScatterplot = function(d, i, j){

                var idx = getIndex(i),
                    idy = getIndex(j),
                    modalTitle = $('#ind_heatmap_modal_title'),
                    modalBody = $('#ind_heatmap_modal_body');

                $('#flcModal')
                    .one('show.bs.modal', function(){
                        modalTitle.html('');
                        modalBody.html('');
                    })
                    .one('shown.bs.modal', function(){
                        var modal = new ScatterplotModal(
                            idx, idy,
                            matrix[idx], matrix[idy],
                            modalTitle, modalBody
                        );
                        modal.render();
                    }).modal('show');
            },
            colorScale = d3.scale.linear()
                .domain([-1, 0, 1])
                .range(['blue', 'white', 'red']);
        }
        d3.select(heatmap.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .append('g')
            .selectAll('g')
            .data(this.cluster_display)
            .enter()
            .append('g')
            .selectAll('rect')
            .data((d)=>d)
            .enter()
            .append('rect')
            .text((d)=>d)
            .attr('x', (d,i,j)=>i * cell_width)
            .attr('y', (d,i,j)=>j * cell_height)
            .attr('width', cell_width)
            .attr('height', cell_height)
            .style('fill', (d)=>colorScale(d))
            .style('cursor', 'pointer')
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip)
            .on('click', showScatterplot);

        $('[data-toggle="tooltip"]').tooltip();
    }

    writeColNames() {
        // remove existing
        this.el.find('#vert_names').remove();

        // create new
        var vert = $('<div id="vert_names">')
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '1%',
                'overflow': 'visible',
                'height': '18%',
                'width': '60%',
            }).appendTo(this.el);

        //Draw SVGs
        // if (this.sort_vector != null) {
        //     var col_names = [],
        //         start = parseInt(this.bin_parameters['window_start']),
        //         step = parseInt(this.bin_parameters['bin_size']);
        //
        //     for (var i = 0; i < parseInt(this.bin_parameters['bin_number']); i++) {
        //         col_names.push((start + step*i) + ':' + (start + step*(i+1) - 1));
        //     }
        //
        //     var height = vert.height(),
        //         width = vert.width(),
        //         ncols = col_names.length;
        //
        //     var data = _.map(col_names, function(d, i){
        //         let name = col_names[i],
        //             x = (((0.5 / ncols) * width) + i * (width / ncols)),
        //             transform = `rotate(90 ${(((0.5/ncols)*width) + i*(width/ncols))},0)`;
        //
        //         return {name, x, transform};
        //     });
        // } else {
        //     var height = vert.height(),
        //         width = vert.width(),
        //         ncols = this.cluster_members.length,
        //         cluster_medoids = this.cluster_medoids,
        //         matrix_names = this.matrix_names;
        //
        //     var data = _.map(this.cluster_members, function(d, i){
        //         let name = (d.length > 1)?
        //                 `(${d.length}) ${cluster_medoids[i]}`:
        //                 matrix_names[i],
        //             x = (((0.5 / ncols) * width) + i * (width / ncols)),
        //             transform = `rotate(90 ${(((0.5/ncols)*width) + i*(width/ncols))},0)`;
        //
        //         return {name, x, transform};
        //     });
        // }

        if (this.sort_vector) {
            var height = vert.height(),
                width = vert.width(),
                range_start = parseInt(this.col_names[0].split(':')[0]),
                range_end = parseInt(this.col_names[this.col_names.length-1].split(':')[1]),
                zero_position = width/(range_end-range_start)*(0-range_start);

            var svg = d3.select(vert.get(0))
                .append('svg')
                .attr('height', height)
                .attr('width', width)
                .style('overflow', 'visible');

            var header_lines = [
                {
                    text: range_start,
                    position: 0,
                },
                {
                    text: range_end,
                    position: width,
                },
                {
                    text: '0',
                    position: zero_position,
                },
            ];

            svg.append('g')
                .selectAll('line')
                .data(header_lines)
                .enter()
                .append('line')
                .attr('x1', function(d) {return d.position;})
                .attr('x2', function(d) {return d.position;})
                .attr('y1', 0.6*height)
                .attr('y2', 0.9*height)
                .style('stroke', 'black')
                .style('stroke-width', 1);

            svg.append('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', 0.9*height)
                .attr('y2', 0.9*height)
                .style('stroke', 'black')
                .style('stroke-width', 1);

            svg.append('g')
                .selectAll('text')
                .data(header_lines)
                .enter()
                .append('text')
                .text(function(d) { return d.text;})
                .attr('x', function(d) {return d.position;})
                .attr('y', 0.45*height)
                .attr('font-family', 'sans-serif')
                .attr('font-size', '12px')
                .attr('fill', 'black')
                .style('text-anchor', 'middle');
        } else {
            var height = vert.height(),
                width = vert.width(),
                ncols = this.col_names.length,
                col_names = this.col_names;

            var data = _.map(col_names, function(d, i){
                let name = d,
                    x = (((0.5 / ncols) * width) + i * (width / ncols)),
                    transform = `rotate(90 ${(((0.5/ncols)*width) + i*(width/ncols))},0)`;

                return {name, x, transform};
            });

            var svg = d3.select(vert.get(0))
                .append('svg')
                .attr('height', height)
                .attr('width', width);

            svg.append('g')
                .selectAll('text')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'heatmapLabelText')
                .text((d)=>d.name)
                .attr('x', (d)=>d.x)
                .attr('y', 0)
                .attr('transform', (d)=>d.transform);
        }
    }

    writeRowNames() {

        this.el.find('#row_names').remove();

        var row_names = $('<div id="row_names">')
            .css({
                'position': 'absolute',
                'left': '21%',
                'top': '20%',
                'overflow': 'hidden',
                'height': '80%',
                'width': '18%',
            }).appendTo(this.el);

        //Draw SVGs
        var height = row_names.height(),
            width = row_names.width(),
            row_number = this.cluster_members.length,
            cluster_medoids = this.cluster_medoids,
            matrix_names = this.matrix_names,
            matrix = this.matrix;

        var svg = d3.select(row_names.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        var data = _.map(this.cluster_members, function(d, i){
            let name = (d.length > 1)?
                    `(${d.length}) ${cluster_medoids[i]}`:
                    matrix[cluster_medoids[i]],
                y = (((0.5 / row_number) * height) + i * (height / row_number));
            return {name, y};
        });

        svg.append('g')
            .selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'heatmapLabelText')
            .text((d)=>d.name)
            .attr('x', 0)
            .attr('y', (d)=>d.y);
    }

    writeDendrogram() {

        this.el.find('#dendrogram').remove();

        var dendro = $('<div id="dendrogram">')
            .css({
                'position': 'absolute',
                'left': '0%',
                'top': '20%',
                'overflow': 'hidden',
                'height': '80%',
                'width': '20%',
            }).appendTo(this.el);

        var line_coords = [],
            icoords = this.dendrogram['icoord'],
            dcoords = this.dendrogram['dcoord'],
            x_max = d3.max(_.flatten(dcoords)),
            y_max = d3.max(_.flatten(icoords)),
            x_min = d3.min(_.flatten(dcoords)),
            y_min = d3.min(_.flatten(icoords)),
            x_rng = x_max - x_min,
            y_rng = y_max - y_min,
            height = dendro.height(),
            width = dendro.width(),
            nleaves = this.dendrogram['leaves'].length,
            leafHeight = ((0.5/nleaves)*height),
            totHeight = height*((nleaves-1)/nleaves);


        line_coords = _.chain(icoords)
            .map(function(ic, i){
                let dc = dcoords[i];
                return _.map([0, 1, 2], function(j){
                    return {
                        y1: leafHeight+((ic[j]-y_min)/y_rng)*totHeight,
                        y2: leafHeight+((ic[j+1]-y_min)/y_rng)*totHeight,
                        x1: width-((dc[j]-x_min)/x_rng)*width,
                        x2: width-((dc[j+1]-x_min)/x_rng)*width,
                    };
                });
            })
            .flatten()
            .value();

        var svg = d3.select(dendro.get(0))
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        svg.append('g')
            .selectAll('line')
            .data(line_coords)
            .enter()
            .append('line')
            .attr('class', 'dendroLine')
            .attr('x1', (d)=>d.x1)
            .attr('x2', (d)=>d.x2)
            .attr('y1', (d)=>d.y1)
            .attr('y2', (d)=>d.y2);
    }

    drawLegend() {
        // remove existing
        this.el.find('#legend').remove();

        // create new
        var legend = $('<div id="legend">')
            .css({
                'position': 'absolute',
                'left': '5%',
                'top': '8%',
                'overflow': 'visible',
                'height': '5%',
                'width': '20%',
            }).appendTo(this.el);

        var height = legend.height(),
            width = legend.width();

        var svg = d3.select(legend.get(0))
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        var gradient = svg
            .append('linearGradient')
            .attr('y1', '0')
            .attr('y2', '0')
            .attr('x1', '0')
            .attr('x2', width)
            .attr('id', 'gradient')
            .attr('gradientUnits', 'userSpaceOnUse');

        gradient
            .append('stop')
            .attr('offset', '0')
            .attr('stop-color', 'blue');

        gradient
            .append('stop')
            .attr('offset', '0.5')
            .attr('stop-color', 'white');

        gradient
            .append('stop')
            .attr('offset', '1')
            .attr('stop-color', 'red');

        svg.append('rect')
            .attr('width', width)
            .attr('height', 0.5 * height)
            .attr('x', '0')
            .attr('y', 0.5 * height)
            .attr('fill', 'url(#gradient)')
            .attr('stroke', 'black')
            .attr('stroke-width', '1');

        var legend_lines = [
            {text: '-1', position: 0},
            {text: '0', position: 0.5 * width},
            {text: '1', position: width},
        ];

        svg.append('g')
            .selectAll('line')
            .data(legend_lines)
            .enter()
            .append('line')
            .attr('x1', (d)=>d.position)
            .attr('x2', (d)=>d.position)
            .attr('y1', 0.3 * height)
            .attr('y2', 0.5 * height)
            .style('stroke', 'black')
            .style('stroke-width', 1);

        svg.append('g')
            .selectAll('text')
            .data(legend_lines)
            .enter()
            .append('text')
            .text((d)=>d.text)
            .attr('x', (d)=>d.position)
            .attr('y', 0.25*height)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .style('text-anchor', 'middle');
    }

    render() {
        this.drawHeatmap();
        this.writeRowNames();
        this.writeColNames();
        this.writeDendrogram();
        this.drawLegend();
    }
}


export default AnalysisOverview;
