import $ from 'jquery';
import d3 from 'd3';
import IndividualHeatmap from './IndividualHeatmap';


class IndividualOverview {

    constructor(el, data) {
        this.el = el;
        this.dendrogram = data['dendrogram'];
        this.cluster_members = data['cluster_members'];
        this.cluster_display = data['max_abs_correlation_values'];
        this.correlation_matrix = data['correlation_matrix'];
        this.matrix_ids = data['matrix_ids'];
        this.matrix_names = data['matrix_names'];
        this.cluster_medoids = data['cluster_medoids'];
        this.sort_vector = data['sort_vector'];
        this.bin_parameters = data['bin_parameters'];
    }

    renderSelectList() {
        function addOptions(el, option_array) {
            var select = el.find('#select_list');

            select.empty();

            d3.select(select.get(0))
                .selectAll('option')
                .data(option_array)
                .enter()
                .append('option')
                .text(function(d) {return d;})
                .attr('value', function(d) {return d;});
        }

        //Remove heatmap div if there; append heatmap div
        this.el.find('#select_list').remove();
        var select_list = $('<select id="select_list"></select>')
            .attr({
                'size': '12',
            })
            .css({
                'height': '55%',
                'width': '30%',
                'font-size': '8px',
                'position': 'absolute',
                'top': '20%',
            })
            .change(this.displayCorrelations.bind(this))
            .appendTo(this.el);

        addOptions(this.el, this.matrix_names);

        select_list[0].selectedIndex = 0;

        var matrix_names = this.matrix_names;
        var selectable = this.selectable;
        var el = this.el;

        this.el.find('#search_field').remove();

        $('<input>')
            .attr({
                'type': 'text',
                'id': 'search_field',
                'placeholder': 'Filter data list',
                'outerWidth': '30%',
                'outerHeight': '15%',
            }).css({
                'position': 'absolute',
                'left': '0%',
                'top': '0%',
                'width': '30%',
                'height': '15%',
                'overflow': 'scroll',
            })

            .on('input', function() {
                let value = this.value.toLowerCase();
                if (value === '') {
                    selectable = matrix_names;
                } else {
                    selectable = $.grep(matrix_names, function(n) {
                        return (n.toLowerCase().includes(value));
                    });
                }
                addOptions(el, selectable);
            })

            .appendTo(this.el);
    }

    addDisplayButtons() {
        this.el.find('#display_heatmap').remove();
        $('<button>Display individual heatmap</button>')
            .attr({
                'type': 'button',
                'class': 'btn btn-primary',
            }).css({
                'position': 'absolute',
                'left': '0%',
                'top': '80%',
                'width': '30%',
            }).click(
                this.displayIndividualHeatmap.bind(this)
            ).appendTo(this.el);
    }

    displayCorrelations() {
        this.el.find('#correlation_plot').remove();
        $('<div id="correlation_plot">')
            .css({
                'height': '100%',
                'width': '68%',
                'position': 'absolute',
                'left': '32%',
                'top': '0%',
                'overflow': 'scroll',
            }).appendTo(this.el);

        if (this.sort_vector) {
            var num = this.matrix_names.length - 1,
                entry_length = 20,
                index = this.matrix_names.indexOf(this.el.find('#select_list').find('option:selected').text()),
                margin = {top: 0, right: 0, bottom: 20, left: 0},
                offset = {top: 20, right: 20, bottom: 100, left: 40},
                // width = (num*entry_length > this.el.find('#correlation_plot').width())
                //     ? (num*entry_length - margin.left - margin.right)
                //     : (this.el.find('#correlation_plot').width() - margin.left - margin.right),
                width = (this.el.find('#correlation_plot').width() - margin.left - margin.right),
                height = this.el.find('#correlation_plot').height();

            $('<div id="graph">')
                .css({
                    'height': height,
                    'width': width,
                    'position': 'absolute',
                    'left': '0%',
                    'top': margin.top,
                    'overflow': 'visible',
                }).appendTo(this.el.find('#correlation_plot'));

            var bin_values = [];
            var start = parseInt(this.bin_parameters['window_start']),
                step = parseInt(this.bin_parameters['bin_size']);

            for (var i = 0; i < parseInt(this.bin_parameters['bin_number']); i++) {
                bin_values.push((start + step*i) + ':' + (start + step*(i+1) - 1));
            }

            var y = d3.scale.linear()
                .domain([-1,1])
                .range([height - offset.top - offset.bottom,0]);
            var x = d3.scale.ordinal()
                .domain(bin_values)
                .rangeBands([6,width - offset.left - offset.right]);

            var graph = d3.select(this.el.find('#graph').get(0)).append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g');

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom')
                .outerTickSize(0);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .ticks(5);

            var data = this.correlation_matrix[index];

            graph.append('g')
                .selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .style('fill', function(d) { if (d >= 0) { return 'red'; } else { return 'blue'; }})
                .attr('x', function(d, i) { return offset.left + x(bin_values[i]); })
                .attr('width', x.rangeBand() - 2)
                .attr('y', function(d) { return offset.top + y(Math.max(0,d)); })
                .attr('height', function(d) { return Math.abs(y(0) - y(d)); });

            graph.append('g')
                .selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .style('fill', 'transparent')
                .attr('x', function(d, i) { return offset.left + x(bin_values[i]); })
                .attr('width', x.rangeBand() - 2)
                .attr('y', offset.top)
                .attr('height', y(-1))
                .on('mouseover', function (d, i) {
                    //d3.select(this).style('stroke', 'black').style('stroke-width', '1');
                    var content = (bin_values[i] + '<br/>' + d.toFixed(2));
                    $(this).tooltip({
                        container: 'body',
                        title: content,
                        html: true,
                        animation: false,
                    });
                    $(this).tooltip('show');
                });
                /*
                .on('mouseout', function () {
                    d3.select(this).style('stroke', 'none');
                });
                */

            $('[data-toggle="tooltip"]').tooltip();

            graph.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + offset.left + ',' + offset.top +')')
                .style('fill', 'none')
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .call(yAxis)
                .selectAll('text')
                .attr('font-size','8px')
                .style('fill', 'black')
                .style('stroke', 'none');

            var lines = [-1, 0, 1];

            graph.append('g')
                .selectAll('line')
                .data(lines)
                .enter()
                .append('line')
                .attr('x1', offset.left)
                .attr('x2', width - offset.right)
                .attr('y1', function(d) { return offset.top + y(d); })
                .attr('y2', function(d) { return offset.top + y(d); })
                .style('stroke', 'black')
                .style('stroke-width', 1)
                .style('stroke-dasharray', function (d) {if (d === 0) {return 'none';} else {return '5,5';}});

            var range_start = parseInt(bin_values[0].split(':')[0]),
                range_end = parseInt(bin_values[bin_values.length-1].split(':')[1]),
                zero_position = (width-offset.left-offset.right)/(range_end-range_start)*(0-range_start);

            var header_lines = [
                {
                    text: range_start,
                    position: offset.left,
                },
                {
                    text: range_end,
                    position: width - offset.right,
                },
                {
                    text: '0',
                    position: offset.left + zero_position,
                },
            ];

            graph.append('g')
                .selectAll('line')
                .data(header_lines)
                .enter()
                .append('line')
                .attr('x1', function(d) {return d.position;})
                .attr('x2', function(d) {return d.position;})
                .attr('y1', 0.70*height)
                .attr('y2', 0.75*height)
                .style('stroke', 'black')
                .style('stroke-width', 1);

            graph.append('line')
                .attr('x1', offset.left)
                .attr('x2', width - offset.right)
                .attr('y1', 0.7*height)
                .attr('y2', 0.7*height)
                .style('stroke', 'black')
                .style('stroke-width', 1);

            graph.append('g')
                .selectAll('text')
                .data(header_lines)
                .enter()
                .append('text')
                .text(function(d) { return d.text;})
                .attr('x', function(d) {return d.position;})
                .attr('y', 0.8*height)
                .attr('font-family', 'sans-serif')
                .attr('font-size', '12px')
                .attr('fill', 'black')
                .style('text-anchor', 'middle');
        } else {
            var num = this.matrix_names.length - 1,
                entry_length = 20,
                index = this.matrix_names.indexOf(this.el.find('#select_list').find('option:selected').text()),
                margin = {top: 0, right: 0, bottom: 20, left: 0},
                offset = {top: 20, right: 0, bottom: 100, left: 40},
                width = (num*entry_length > this.el.find('#correlation_plot').width())
                    ? (num*entry_length - margin.left - margin.right)
                    : (this.el.find('#correlation_plot').width() - margin.left - margin.right),
                height = this.el.find('#correlation_plot').height();

            $('<div id="graph">')
                .css({
                    'height': height,
                    'width': width,
                    'position': 'absolute',
                    'left': '0%',
                    'top': margin.top,
                }).appendTo(this.el.find('#correlation_plot'));

            var sortable = [],
                correlation_matrix = this.correlation_matrix,
                matrix_names = this.matrix_names;

            for (let i = 0; i < correlation_matrix[index].length; i++) {
                if (i !== index) {
                    sortable.push([matrix_names[i], correlation_matrix[index][i]]);
                }
            }

            sortable.sort(function(a, b) {return Math.abs(b[1]) - Math.abs(a[1]);});

            var y = d3.scale.linear()
                .domain([-1,1])
                .range([height - offset.top - offset.bottom,0]);
            var x = d3.scale.ordinal()
                .domain(sortable.map(function(d) {return d[0];}))
                .rangeBands([6,width - offset.left - offset.right]);

            var graph = d3.select(this.el.find('#graph').get(0)).append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g');

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom')
                .outerTickSize(0);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .ticks(5);

            graph.append('g')
                .selectAll('rect')
                .data(sortable)
                .enter()
                .append('rect')
                .style('fill', function(d) { if (d[1] >= 0) { return 'red'; } else { return 'blue'; }})
                .attr('x', function(d) { return offset.left + x(d[0]); })
                .attr('width', x.rangeBand() - 2)
                .attr('y', function(d) { return offset.top + y(Math.max(0,d[1])); })
                .attr('height', function(d) { return Math.abs(y(0) - y(d[1])); });


            graph.append('g')
                .selectAll('rect')
                .data(sortable)
                .enter()
                .append('rect')
                .style('fill', 'transparent')
                .attr('x', function(d) { return offset.left + x(d[0]); })
                .attr('width', x.rangeBand() - 2)
                .attr('y', offset.top)
                .attr('height', y(-1))
                .on('mouseover', function (d) {
                    //d3.select(this).style('stroke', 'black').style('stroke-width', '1');
                    var content = (d[0] + '<br/>' + d[1].toFixed(2));
                    $(this).tooltip({
                        container: 'body',
                        title: content,
                        html: true,
                        animation: false,
                    });
                    $(this).tooltip('show');
                });
                /*
                .on('mouseout', function () {
                    d3.select(this).style('stroke', 'none');
                });
                */

            $('[data-toggle="tooltip"]').tooltip();

            graph.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(' + offset.left + ',' + (height - offset.bottom) + ')')
                .call(xAxis)
                .style('fill', 'none')
                .selectAll('text')
                .style('fill', 'black')
                .attr('font-size', '8px')
                .style('text-anchor', 'end')
                .attr('transform', 'rotate(-90)' )
                .attr('dx', '-8px')
                .attr('dy', '-8px');

            graph.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + offset.left + ',' + offset.top +')')
                .style('fill', 'none')
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .call(yAxis)
                .selectAll('text')
                .attr('font-size','8px')
                .style('fill', 'black')
                .style('stroke', 'none');

            var lines = [-1, 0, 1];

            graph.append('g')
                .selectAll('line')
                .data(lines)
                .enter()
                .append('line')
                .attr('x1', offset.left)
                .attr('x2', width - offset.right)
                .attr('y1', function(d) { return offset.top + y(d); })
                .attr('y2', function(d) { return offset.top + y(d); })
                .style('stroke', 'black')
                .style('stroke-width', 1)
                .style('stroke-dasharray', function (d) {if (d === 0) {return 'none';} else {return '5,5';}});
        }
    }

    displayIndividualHeatmap () {
        var name = this.el.find('#select_list').find('option:selected').text(),
            names = this.matrix_names,
            ids = this.matrix_ids,
            selected = names.indexOf(name),
            matrix_id = ids[selected],
            modalTitle = $('#ind_heatmap_modal_title'),
            modalBody = $('#ind_heatmap_modal_body'),
            sort_vector = this.sort_vector;

        $('#flcModal')
            .one('show.bs.modal', function(){
                modalTitle.html('');
                modalBody.html('');
            })
            .one('shown.bs.modal', function(){
                var individual_heatmap = new IndividualHeatmap(
                    matrix_id,
                    names,
                    ids,
                    name,
                    modalTitle,
                    modalBody,
                    sort_vector,
                );
                individual_heatmap.render();
            }).modal('show');
    }

    render() {
        this.renderSelectList();
        this.addDisplayButtons();
        this.displayCorrelations();
    }

}

export default  IndividualOverview;
