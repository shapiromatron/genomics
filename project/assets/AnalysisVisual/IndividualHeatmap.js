import $ from 'jquery';
import d3 from 'd3';
import _ from 'underscore';


class IndividualHeatmap {

    constructor (id, matrix_names, matrix_ids, heatmap_name, modal_title, modal_body, sort_vector) {
        this.id = id;
        this.matrix_names = matrix_names;
        this.matrix_ids = matrix_ids;
        this.heatmap_name = heatmap_name;
        this.modal_title = modal_title;
        this.modal_body = modal_body;
        this.selected_sort = null;
        this.sort_vector = sort_vector;

        this.matrices = _.zip(this.matrix_ids, this.matrix_names);
    }

    url(id) {
        return '/dashboard/api/feature-list-count-matrix/' + id + '/plot/';
    }

    sortVectorUrl(id, vector_id){
        return window.sortVectorRoot +'?id=' + vector_id;
    }

    getSortVector(vector_id){
        var self = this;
        $.get(this.sortVectorUrl(this.id, vector_id), function(d){
            $.get(self.url(self.id), function(data){
                var display_data = d3.tsv.parseRows(data);
                self.drawHeatmap(display_data, d);
                self.drawQuartiles(display_data, d);
            });
        });
        $.get(`${window.ksURL}?vector_id=${vector_id}&matrix_id=${this.id}`, function(d){
            self.displayQuartilePValue(d['significance']);
        });
    }

    renderUnsorted() {
        var self = this;
        $.get(this.url(this.id), function(data){
            var display_data = d3.tsv.parseRows(data);
            self.drawHeatmap(display_data, null);
            self.drawQuartiles(display_data, null);
        });
        $.get(`${window.unsortedKsURL}?matrix_id=${this.id}`, function(d){
            self.displayQuartilePValue(d['significance']);
        });
    }

    renderBySortVector() {
        var self = this,
            w_index = [],
            sort_order = [];
        for (var i in this.sort_vector) {
            w_index.push([this.sort_vector[i], i])
        }
        w_index.sort(function(x, y) {
          return x[0] > y[0] ? -1 : 1;
        });
        for (var i in w_index) {
            sort_order.push(w_index[i][1]);
        }
        $.get(this.url(this.id), function(data){
            var display_data = d3.tsv.parseRows(data);
            self.drawHeatmap(display_data, sort_order);
            self.drawQuartiles(display_data, sort_order);
        });
        $.get(`${window.userSortKsURL}?matrix_id=${this.id}`, function(d){
            self.displayQuartilePValue(d['significance']);
        });
    }

    displayQuartilePValue(p) {
        this.modal_body.find('#quartile_pval').remove();
        $(`<p id="quartile_pval">p-value = ${p.toExponential(2)}</p>`)
            .css({
                'position': 'absolute',
                'left': '11%',
                'top': '37%',
                'height': '25%',
                'width': '40%',
            })
            .appendTo(this.modal_body);
    }

    createResortOptions() {
        var self = this;
        //Remove heatmap div if there; append heatmap div
        this.modal_body.find('#select_list').remove();

        $('<h4>')
            .text('Feature list order')
            .css({
                'position': 'absolute',
                'top': '63%',
                'left': '5%',
            })
            .appendTo(this.modal_body);

        var select_list = $('<select>')
            .attr({
                'size': '12',
            })
            .css({
                'height': '15%',
                'width': '33.5%',
                'font-size': '8px',
                'position': 'absolute',
                'top': '68%',
                'left': '5%',

            })
            .appendTo(this.modal_body);

        var options = this.matrices;
        if (this.sort_vector) {
            options.unshift(['Sort vector order','Sort vector order']);
        }
        options.unshift(['Feature list order', 'Feature list order']);

        d3.select(select_list.get(0))
            .selectAll('option')
            .data(this.matrices)
            .enter()
            .append('option')
            .text(function(d) {return d[1];})
            .attr('value', function(d) {return d[0];});

        this.modal_body.find('#displayCorrelations').remove();

        $('<button>')
            .text('Reorder heatmap')
            .attr({
                'id': 'displayCorrelations',
                'class': 'btn btn-primary',
            })
            .css({
                'width': '20%',
                'position': 'absolute',
                'top': '84%',
                'left': '5%',
            })
            .appendTo(this.modal_body)
            .click(function(){
                if (select_list.val() == 'Feature list order') {
                    self.renderUnsorted();
                } else if (select_list.val() == 'Sort vector order') {
                    self.renderBySortVector();
                } else {
                    self.getSortVector(select_list.val());
                }
            });
    }

    drawQuartiles(display_data, sort_order) {

        this.modal_body.find('#quartile_plot').remove();
        var quartile_plot = $('<div id="quartile_plot"></div>')
            .css({
                'position': 'absolute',
                'left': '0%',
                'top': '35%',
                'height': '25%',
                'width': '40%',
            })
            .appendTo(this.modal_body);


        this.modal_body.find('#quartile_label').remove();
        var quartile_label = $('<div id="quartile_label"></div>')
            .css({
                'position': 'absolute',
                'left': '5%',
                'top': '33%',
                'height': '2%',
                'width': '30%',
            })
            .appendTo(this.modal_body);

        quartile_label.append('<p>Quartiles, bin averages:</p>');

        this.modal_body.find('#quartile_legend').remove();
        var quartile_legend = $('<div id="quartile_legend"></div>')
            .css({
                'position': 'absolute',
                'left': '10%',
                'top': '60%',
                'height': '5%',
                'width': '30%',
            })
            .appendTo(this.modal_body);


        var height = quartile_plot.height(),
            width = quartile_plot.width(),
            legend_height = quartile_legend.height(),
            legend_width = quartile_legend.width(),
            margins = {
                'top': 0.1 * height,
                'bottom': 0.15 * height,
                'left': 0.25 * width,
                'right': 0.05 * width,
            },
            colors = ['red', 'orange', 'blue', 'black'];

        var legend = d3.select(quartile_legend.get(0))
            .append('svg')
            .attr('height', legend_height)
            .attr('width', legend_width)
            .style('overflow', 'visible');

        legend.append('g')
            .selectAll('rect')
            .data(colors)
            .enter()
            .append('rect')
            .attr('x', function(d,i) { return (i * (legend_width/5)); })
            .attr('y', 1*legend_height/4)
            .attr('width', '10')
            .attr('height', '10')
            .style('fill', function(d) {return d;});

        legend.append('g')
            .selectAll('text')
            .data(colors)
            .enter()
            .append('text')
            .text(function(d, i) { return i;})
            .attr('x', function(d, i) {return (i * (legend_width/5)) + 20;})
            .attr('y', 2.25*legend_height/4)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .style('text-anchor', 'left');

        var row_number = display_data.length-1;
        var window_values = [];

        for (var i = 1; i < display_data[0].length; i++) {
            var val_1 = parseInt(display_data[0][i].split(':')[0]),
                val_2 = parseInt(display_data[0][i].split(':')[1]);
            window_values.push((val_1 + val_2)/2);
        }

        var quartiles = [
            new Array(display_data[1].length-1).fill(0),
            new Array(display_data[1].length-1).fill(0),
            new Array(display_data[1].length-1).fill(0),
            new Array(display_data[1].length-1).fill(0),
        ];

        var quartile_count = [0, 0, 0, 0];

        for (i = 1; i < display_data.length; i++) {
            var index = Math.floor((i-1) / (row_number/4));
            var row_index = (sort_order) ? sort_order[i-1] : i;
            quartile_count[index]++;
            for (var j = 1; j < display_data[row_index].length; j++) {
                quartiles[index][j-1] = quartiles[index][j-1] + parseFloat(display_data[row_index][j]);
            }
        }

        for (i = 0; i < quartiles.length; i++) {
            for (j = 0; j < quartiles[i].length; j++ ) {
                quartiles[i][j] = quartiles[i][j]/quartile_count[i];
            }
        }

        var max_value = Math.max(...[].concat.apply([],quartiles));

        var y = d3.scale.linear()
            .domain([0, max_value])
            .range([(height - margins.top - margins.bottom), 0]);
        var x = d3.scale.linear()
            .domain([parseInt(display_data[0][1].split(':')[0]), parseInt(display_data[0][display_data[0].length-1].split(':')[1])])
            .range([0, (width - margins.left - margins.right)]);

        var line = d3.svg.line()
            .x(function(d) { return x(d[0]);})
            .y(function(d) { return y(d[1]);});

        var graph = d3.select(quartile_plot.get(0))
            .append('svg:svg')
            .attr('height', height)
            .attr('width', width)
            .append('svg:g')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        var xAxis = d3.svg.axis().scale(x).ticks(4).tickSubdivide(true);
        graph.append('svg:g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (height - margins.top - margins.bottom) + ')')
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).ticks(2).orient('left');
        graph.append('svg:g')
            .attr('class', 'y axis')
            .call(yAxisLeft);

        for (i = 0; i < quartiles.length; i++) {
            var scatter = [],
                line_color = colors[i];
            for (j = 0; j < quartiles[i].length; j++) {
                scatter.push([window_values[j], quartiles[i][j]]);
            }
            graph.append('svg:path').attr('d', line(scatter))
                .style('stroke', line_color);
        }
    }

    drawMetaPlot(display_data) {
        var modal_body = this.modal_body;

        modal_body.find('#metaplot_label').remove();

        var metaplot_label = $('<div id="metaplot_label">')
            .css({
                'position': 'absolute',
                'left': '5%',
                'top': '3%',
                'height': '2%',
                'width': '40%',
            })
            .appendTo(modal_body);

        metaplot_label.append('<p>Bin averages:</p>');

        modal_body.find('#metaplot').remove();

        var metaplot = $('<div id="metaplot"></div>')
            .css({
                'position': 'absolute',
                'left': '0%',
                'top': '5%',
                'height': '25%',
                'width': '40%',
            })
            .appendTo(modal_body);

        var height = metaplot.height(),
            width = metaplot.width(),
            margins = {
                'top': 0.1 * height,
                'bottom': 0.15 * height,
                'left': 0.25 * width,
                'right': 0.05 * width,
            };

        var row_number = display_data.length-1,
            window_values = [];

        for (var i = 1; i < display_data[0].length; i++) {
            var val_1 = parseInt(display_data[0][i].split(':')[0]),
                val_2 = parseInt(display_data[0][i].split(':')[1]);
            window_values.push((val_1 + val_2)/2);
        }

        var metaplot_data = new Array(display_data[1].length-1).fill(0);

        for (i = 1; i < display_data.length; i++) {
            for (var j = 1; j < display_data[i].length; j++) {
                metaplot_data[j-1] = metaplot_data[j-1] + parseFloat(display_data[i][j]);
            }
        }

        metaplot_data = metaplot_data.map(function(obj) {
            return (obj/row_number);
        });

        var scatter = [];
        for (i = 0; i < metaplot_data.length; i++) {
            scatter.push([window_values[i], metaplot_data[i]]);
        }

        var y = d3.scale.linear()
            .domain([0, d3.max(metaplot_data)])
            .range([(height - margins.top - margins.bottom), 0]);
        var x = d3.scale.linear()
            .domain([display_data[0][1].split(':')[0], display_data[0][display_data[0].length-1].split(':')[1]])
            .range([0, (width - margins.left - margins.right)]);

        var line = d3.svg.line()
            .x(function(d) { return x(d[0]);})
            .y(function(d) { return y(d[1]);});

        var graph = d3.select(metaplot.get(0))
            .append('svg:svg')
            .attr('height', height)
            .attr('width', width)
            .append('svg:g')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        var xAxis = d3.svg.axis().scale(x).ticks(4).tickSubdivide(true);
        graph.append('svg:g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (height - margins.top - margins.bottom) + ')')
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).ticks(2).orient('left');
        graph.append('svg:g')
            .attr('class', 'class')
            .call(yAxisLeft);

        graph.append('svg:path').attr('d', line(scatter));
    }

    drawHeatmapHeader(display_data) {
        var modal_body = this.modal_body;

        modal_body.find('#heatmap_header').remove();

        var heatmap_header = $('<div id=\'heatmap_header\'></div>')
            .css({
                'height': 0.10 * modal_body.height(),
                'width': 0.55 * modal_body.width(),
                'position': 'absolute',
                'left': '40%',
                'top': '0%',
            })
            .appendTo(modal_body);

        var height = heatmap_header.height(),
            width = heatmap_header.width(),
            range_start = parseInt(display_data[0][1].split(':')[0]),
            range_end = parseInt(display_data[0][display_data[0].length-1].split(':')[1]),
            zero_position = width/(range_end-range_start)*(0-range_start);

        var svg = d3.select(heatmap_header.get(0))
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
    }

    drawHeatmap(display_data, sort_order) {
        var modal_body = this.modal_body;

        modal_body.find('#heatmap_canvas').remove();

        var heatmap_canvas = $('<canvas id="heatmap_canvas"></canvas>')
            .prop({
                'height': 0.85 * modal_body.height(),
                'width': 0.55 * modal_body.width(),
            })
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '10%',
            })
            .appendTo(modal_body);

        // Get all but first row; remove first column
        display_data = display_data.slice(1);
        for (var i = 0; i < display_data.length; i++) {
            display_data[i] = display_data[i].slice(1);
        }

        var row_number = display_data.length,
            col_number = display_data[0].length,
            height = heatmap_canvas.height(),
            width = heatmap_canvas.width(),
            context = document.getElementById('heatmap_canvas').getContext('2d');

        var data_max = -Infinity;
        var data_values = []
        for (i = 0; i < display_data.length; i++) {
            for (var j = 0; j < display_data[i].length; j++) {
                if (display_data[i][j] > data_max) data_max = display_data[i][j];
                data_values.push(display_data[i][j]);
            }
        }
        data_values.sort(function(a,b){
            return a - b;
        });
        var upper_quartile = d3.quantile(data_values, 0.75);
        var median = d3.quantile(data_values, 0.50);

        var colorScale = d3.scale.linear()
            .domain([median, upper_quartile])
            .range(['white', 'red']);

        var scale_x = width/col_number,
            scale_y = height/row_number;

        context.scale(scale_x, scale_y);

        for (i = 0; i < display_data.length; i++) {
            var row_index = (sort_order) ? sort_order[i] : i;
            for (j = 0; j < display_data[row_index].length; j++) {
                context.fillStyle=colorScale(display_data[row_index][j]);
                context.fillRect(j,i,1,1);
            }
        }
    }

    render() {
        this.modal_title.html(this.heatmap_name);
        var self = this;
        $.get(this.url(this.id), function(data){
            var display_data = d3.tsv.parseRows(data);
            self.drawHeatmapHeader(display_data);
            self.drawHeatmap(display_data, null);
            self.drawMetaPlot(display_data);
            self.drawQuartiles(display_data, null);
            self.createResortOptions();
        });
        $.get(`${window.unsortedKsURL}?matrix_id=${this.id}`, function(d){
            self.displayQuartilePValue(d.significance);
        });
    }

}

export default IndividualHeatmap;
