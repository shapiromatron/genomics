var IndividualHeatmap = function(selected_value, matrix_names, modal_title, modal_body) {
    this.selected_value = selected_value;
    this.matrix_names = matrix_names;
    this.modal_title = modal_title;
    this.modal_body = modal_body;
    this.selected_sort = null;
};
IndividualHeatmap.prototype = {
    addButtons: function() {
        var self = this;

        $('#' + self.modal_body + '> #display_correlations').remove();
        $('#' + self.modal_body).append(
            '<button id=\'display_correlations\' type=\'button\' class=\'btn btn-primary\'>Reorder heatmap</button>'
        );
        $('#' + self.modal_body + '> #display_correlations').css({
            'position': 'absolute', 'left': '5%', 'top': '84%', 'width': '20%'
        });
    },
    createSelect: function() {
        var self = this;

        //Remove heatmap div if there; append heatmap div
        $('#' + self.modal_body + '> #select_list').remove();
        $('#' + self.modal_body).append('<select id=\'select_list\'></select>');

        //Add attributes, style to div
        $('#' + self.modal_body + '> #select_list').height('15%');
        $('#' + self.modal_body + '> #select_list').width('33.5%');
        $('#' + self.modal_body + '> #select_list').attr('size', '12');
        $('#' + self.modal_body + '> #select_list').css({
            'font-size': '8px', 'position': 'absolute', 'top': '68%', 'left': '5%'
        });

        $('#' + self.modal_body + '> #select_list').append('<option>Feature list order</option>')

        var sort_list = d3.select('#' + self.modal_body + '> #select_list')
            .selectAll('option')
            .data(self.matrix_names)
            .enter()
            .append('option')
            .text(function(d) {return d;})
            .attr('value', function(d) {return d;});

        $('#' + self.modal_body + '> #select_list').prop('selectedIndex', '0');
    },
    url: function(id) {
        return "/dashboard/api/feature-list-count-matrix/" + id + "/plot/";
    },
    drawQuartiles: function(display_data) {
        var self = this;

        $('#' + self.modal_body + '> #quartile_plot').remove();
        $('#' + self.modal_body).append('<div id=\'quartile_plot\'></div>');

        $('#' + self.modal_body + '> #quartile_plot').css({
            'position': 'absolute', 'left': '0%', 'top': '35%', 'height': '25%', 'width': '40%'
        });

        $('#' + self.modal_body + '> #quartile_label').remove();
        $('#' + self.modal_body).append('<div id=\'quartile_label\'></div>');

        $('#' + self.modal_body + '> #quartile_label').css({
            'position': 'absolute', 'left': '5%', 'top': '33%', 'height': '2%', 'width': '30%'
        });
        $('#' + self.modal_body + '> #quartile_label').append('<p>Quartiles, bin averages:</p>');

        $('#' + self.modal_body + '> #quartile_legend').remove();
        $('#' + self.modal_body).append('<div id=\'quartile_legend\'></div>');

        $('#' + self.modal_body + '> #quartile_legend').css({
            'position': 'absolute', 'left': '10%', 'top': '60%', 'height': '5%', 'width': '30%'
        });

        var height = $('#' + self.modal_body + '> #quartile_plot').height();
        var width = $('#' + self.modal_body + '> #quartile_plot').width();

        var legend_height = $('#' + self.modal_body + '> #quartile_legend').height();
        var legend_width = $('#' + self.modal_body + '> #quartile_legend').width();

        var margins = {
            "top": 0.1 * height,
            "bottom": 0.15 * height,
            "left": 0.25 * width,
            "right": 0.05 * width
        };

        var colors = ['red', 'orange', 'blue', 'black'];

        var legend = d3.select('#' + self.modal_body + '> #quartile_legend')
            .append("svg")
            .attr("height", legend_height)
            .attr("width", legend_width)
            .style("overflow", "visible");

        legend.append("g")
            .selectAll("rect")
            .data(colors)
            .enter()
            .append("rect")
            .attr('x', function(d,i) { return (i * (legend_width/5)); })
            .attr('y', 1*legend_height/4)
            .attr('width', '10')
            .attr('height', '10')
            .style('fill', function(d) {return d;});

        legend.append("g")
            .selectAll("text")
            .data(colors)
            .enter()
            .append("text")
            .text(function(d, i) { return i;})
            .attr("x", function(d, i) {return (i * (legend_width/5)) + 20;})
            .attr("y", 2.25*legend_height/4)
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .style("text-anchor", "left");

        var row_number = display_data.length-1;

        var window_values = [];

        for (var i = 1; i < display_data[0].length; i++) {
            var val_1 = parseInt(display_data[0][i].split(':')[0]);
            var val_2 = parseInt(display_data[0][i].split(':')[1]);
            window_values.push((val_1 + val_2)/2);
        }

        var quartiles = [
            new Array(display_data[1].length-1).fill(0),
            new Array(display_data[1].length-1).fill(0),
            new Array(display_data[1].length-1).fill(0),
            new Array(display_data[1].length-1).fill(0)
        ];

        var quartile_count = [0,0,0,0];

        for (var i = 1; i < display_data.length; i++) {
            var index = Math.floor((i-1) / (row_number/4));
            quartile_count[index]++;
            for (var j = 1; j < display_data[i].length; j++) {
                quartiles[index][j-1] = quartiles[index][j-1] + parseFloat(display_data[i][j]);
            }
        }

        for (var i = 0; i < quartiles.length; i++) {
            for (var j = 0; j < quartiles[i].length; j++ ) {
                quartiles[i][j] = quartiles[i][j]/quartile_count[i];
            }
        }

        var max_value = Math.max(...[].concat.apply([],quartiles));

        var y = d3.scale.linear()
            .domain([0, max_value])
            .range([(height - margins.top - margins.bottom), 0]);
        var x = d3.scale.linear()
            .domain([parseInt(display_data[0][1].split(":")[0]), parseInt(display_data[0][display_data[0].length-1].split(":")[1])])
            .range([0, (width - margins.left - margins.right)]);

        var line = d3.svg.line()
            .x(function(d) { return x(d[0]);})
            .y(function(d) { return y(d[1]);});

        var graph = d3.select("#quartile_plot").append("svg:svg")
            .attr("height", height)
            .attr("width", width)
            .append("svg:g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        var xAxis = d3.svg.axis().scale(x).ticks(4).tickSubdivide(true);
        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margins.top - margins.bottom) + ")")
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).ticks(2).orient("left");
        graph.append("svg:g")
            .attr("class", "y axis")
            .call(yAxisLeft);

        for (var i = 0; i < quartiles.length; i++) {
            var scatter = [];
            var line_color = colors[i];
            for (var j = 0; j < quartiles[i].length; j++) {
                scatter.push([window_values[j], quartiles[i][j]]);
            }
            graph.append("svg:path").attr("d", line(scatter))
                .style('stroke', line_color);
        }
    },
    drawMetaPlot: function(display_data) {
        var self = this;

        $('#' + self.modal_body + '> #metaplot_label').remove();
        $('#' + self.modal_body).append('<div id=\'metaplot_label\'></div>');

        $('#' + self.modal_body + '> #metaplot_label').css({
            'position': 'absolute', 'left': '5%', 'top': '3%', 'height': '2%', 'width': '40%'
        });

        $('#' + self.modal_body + '> #metaplot_label').append('<p>Bin averages:</p>');

        $('#' + self.modal_body + '> #metaplot').remove();
        $('#' + self.modal_body).append('<div id=\'metaplot\'></div>');

        $('#' + self.modal_body + '> #metaplot').css({
            'position': 'absolute', 'left': '0%', 'top': '5%', 'height': '25%', 'width': '40%'
        });

        var height = $('#' + self.modal_body + '> #metaplot').height();
        var width = $('#' + self.modal_body + '> #metaplot').width();

        var margins = {
            "top": 0.1 * height,
            "bottom": 0.15 * height,
            "left": 0.25 * width,
            "right": 0.05 * width
        };

        var row_number = display_data.length-1;

        var window_values = [];

        for (var i = 1; i < display_data[0].length; i++) {
            var val_1 = parseInt(display_data[0][i].split(':')[0]);
            var val_2 = parseInt(display_data[0][i].split(':')[1]);
            window_values.push((val_1 + val_2)/2);
        }

        var metaplot = new Array(display_data[1].length-1).fill(0);

        for (var i = 1; i < display_data.length; i++) {
            for (var j = 1; j < display_data[i].length; j++) {
                metaplot[j-1] = metaplot[j-1] + parseFloat(display_data[i][j]);
            }
        }

        metaplot = metaplot.map(function(obj) {
            return (obj/row_number);
        });

        var scatter = [];
        for (var i = 0; i < metaplot.length; i++) {
            scatter.push([window_values[i], metaplot[i]]);
        }

        var y = d3.scale.linear()
            .domain([0, d3.max(metaplot)])
            .range([(height - margins.top - margins.bottom), 0]);
        var x = d3.scale.linear()
            .domain([display_data[0][1].split(":")[0], display_data[0][display_data[0].length-1].split(":")[1]])
            .range([0, (width - margins.left - margins.right)]);

        var line = d3.svg.line()
            .x(function(d) { return x(d[0]);})
            .y(function(d) { return y(d[1]);});

        var graph = d3.select("#metaplot").append("svg:svg")
            .attr("height", height)
            .attr("width", width)
            .append("svg:g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        var xAxis = d3.svg.axis().scale(x).ticks(4).tickSubdivide(true);
        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margins.top - margins.bottom) + ")")
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).ticks(2).orient("left");
        graph.append("svg:g")
            .attr("class", "y axis")
            .call(yAxisLeft);

        graph.append("svg:path").attr("d", line(scatter));
    },
    drawHeatmapHeader: function(display_data) {
        var self = this;

        $('#' + self.modal_body + '> #heatmap_header').remove();
        $('#' + self.modal_body).append('<div id=\'heatmap_header\'></div>');

        $('#' + self.modal_body + '> #heatmap_header').height(0.10*$('#' + self.modal_body).height());
        $('#' + self.modal_body + '> #heatmap_header').width(0.55*$('#' + self.modal_body).width());
        $('#' + self.modal_body + '> #heatmap_header').css({
            'position': 'absolute', 'left': '40%', 'top': '0%'
        });

        var height = $('#' + self.modal_body + '> #heatmap_header').height();
        var width = $('#' + self.modal_body + '> #heatmap_header').width();

        var range_start = parseInt(display_data[0][1].split(":")[0]);
        var range_end = parseInt(display_data[0][display_data[0].length-1].split(":")[1]);

        var zero_position = width/(range_end-range_start)*(0-range_start);

        var svg = d3.select('#' + self.modal_body + "> #heatmap_header")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .style("overflow", "visible");

        var header_lines = [
            {text: range_start, position: 0},
            {text: range_end, position: width},
            {text: "0", position: zero_position}
        ];

        svg.append("g")
            .selectAll("line")
            .data(header_lines)
            .enter()
            .append("line")
            .attr("x1", function(d) {return d.position;})
            .attr("x2", function(d) {return d.position;})
            .attr("y1", 0.6*height)
            .attr("y2", 0.9*height)
            .style("stroke", "black")
            .style("stroke-width", 1);

        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", 0.9*height)
            .attr("y2", 0.9*height)
            .style("stroke", "black")
            .style("stroke-width", 1);

        svg.append("g")
            .selectAll("text")
            .data(header_lines)
            .enter()
            .append("text")
            .text(function(d) { return d.text;})
            .attr("x", function(d) {return d.position;})
            .attr("y", 0.45*height)
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .style("text-anchor", "middle");
    },
    drawHeatmap: function(display_data) {
        $('#' + this.modal_body + '> #heatmap_canvas').remove();
        $('#' + this.modal_body).append('<canvas id=\'heatmap_canvas\'></canvas>');

        $('#' + this.modal_body + '> #heatmap_canvas').prop('height',0.85*$('#' + this.modal_body).height());
        $('#' + this.modal_body + '> #heatmap_canvas').prop('width',0.55*$('#' + this.modal_body).width());
        $('#' + this.modal_body + '> #heatmap_canvas').css({
            'position': 'absolute', 'left': '40%', 'top': '10%'
        });

        // Get all but first row; remove first column
        var display_data = display_data.slice(1);
        for (i = 0; i < display_data.length; i++) {
            display_data[i] = display_data[i].slice(1);
        }

        var row_number = display_data.length;
        var col_number = display_data[0].length;

        var height = $('#' + this.modal_body + '> #heatmap_canvas').height();
        var width = $('#' + this.modal_body + '> #heatmap_canvas').width();

        var context = document.getElementById('heatmap_canvas').getContext('2d');

        var data_max = -Infinity;
        for (var i = 0; i < display_data.length; i++) {
            for (var j = 0; j < display_data[i].length; j++) {
                if (display_data[i][j] > data_max) data_max = display_data[i][j];
            }
        }

        var colorScale = d3.scale.linear()
            .domain([0, data_max])
            .range(['white','red']);

        var scale_x = width/col_number;
        var scale_y = height/row_number;

        context.scale(scale_x,scale_y);

        for (var i = 0; i < display_data.length; i++) {
            for (var j = 0; j < display_data[i].length; j++) {
                context.fillStyle=colorScale(display_data[i][j]);
                context.fillRect(j,i,1,1);
            }
        }
    },
    render: function() {
        var self = this;

        $('#' + self.modal_title).html(self.matrix_names[self.selected_value]);

        $.get(this.url(this.selected_value), function(data){
            var display_data = d3.tsv.parseRows(data);
            self.drawHeatmapHeader(display_data);
            self.drawHeatmap(display_data);
            self.drawMetaPlot(display_data);
            self.drawQuartiles(display_data);
            self.createSelect();
            self.addButtons();
        });
    },
};
