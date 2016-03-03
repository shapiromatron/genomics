var IndividualOverview = function(data, parent_div) {
    var self = this;

    self.dendrogram = data['dendrogram'];
    self.cluster_members = data['cluster_members'];
    self.cluster_display = data['max_abs_correlation_values'];
    self.correlation_matrix = data['correlation_matrix'];
    self.matrix_ids = data['matrix_ids'];
    self.matrix_names = data['matrix_names'];
    self.cluster_medoids = data['cluster_medoids'];

    self.names_crosswalk = _.object(self.matrix_ids, self.matrix_names);

    self.selectable = data['matrix_names'];

    self.parent_div = parent_div;
};
IndividualOverview.prototype = {
    renderSelectList: function() {
        var self = this;

        //Remove heatmap div if there; append heatmap div
        $('#' + self.parent_div + '> #select_list').remove();
        $('#' + self.parent_div).append('<select id=\'select_list\'></select>');

        //Add attributes, style to div
        $('#' + self.parent_div + '> #select_list').height('40%');
        $('#' + self.parent_div + '> #select_list').width('30%');
        $('#' + self.parent_div + '> #select_list').attr('size', '12');
        $('#' + self.parent_div + '> #select_list').css({
            'font-size': '8px', 'position': 'absolute', 'top': '20%'
        });

        var sort_list = d3.select('#' + self.parent_div + '> #select_list')
            .selectAll('option')
            .data(_.pairs(self.names_crosswalk))
            .enter()
            .append('option')
            .text(function(d) {return d[1];})
            .attr('value', function(d) {return d[0];});

        $('#' + self.parent_div + '> #select_list').prop('selectedIndex', '0');
    },
    addDisplayButtons: function() {
        var self = this;

        //Remove heatmap div if there; append heatmap div
        $('#' + self.parent_div + '> #display_correlations').remove();
        $('#' + self.parent_div).append(
            '<button id=\'display_correlations\' type=\'button\' class=\'btn btn-primary\'>Display correlation values</button>'
        );
        $('#' + self.parent_div + '> #display_correlations').css({
            'position': 'absolute', 'left': '0%', 'top': '65%', 'width': '30%'
        });
        $('#' + self.parent_div + '> #display_correlations').click(
            self.displayCorrelations.bind(this)
        );

        //Remove heatmap div if there; append heatmap div
        $('#' + self.parent_div).remove('#display_heatmap');
        $('#' + self.parent_div).append(
            '<button id=\'display_heatmap\' type=\'button\' class=\'btn btn-primary\'>Display individual heatmap</button>'
        );
        $('#' + self.parent_div + '> #display_heatmap').css({
            'position': 'absolute', 'left': '0%', 'top': '80%', 'width': '30%'
        });
        $('#' + self.parent_div + '> #display_heatmap').click(
            self.displayIndividualHeatmap.bind(this)
        );
    },
    displayCorrelations: function() {
        var self = this;

        //Remove correlation_plot div if there; append correlation_plot div
        $('#' + self.parent_div + '> #correlation_plot').remove();
        $('#' + self.parent_div).append('<div id=\'correlation_plot\'></div>');

        //Add attributes, style to div
        $('#' + self.parent_div + '> #correlation_plot').height('100%');
        $('#' + self.parent_div + '> #correlation_plot').width('68%');
        $('#' + self.parent_div + '> #correlation_plot').css({
            'position': 'absolute', 'left': '32%', 'top': '0%', 'overflow': 'scroll'
        });

        $('#' + self.parent_div + '> #correlation_plot').append('<div id=\'graph\'></div>');

        var num = self.matrix_names.length - 1;
        var entry_length = 20;

        var index = $('#' + self.parent_div + '> #select_list').find('option:selected').index();

        var margin = {top: 0, right: 20, bottom: 20, left: 20},
            offset = {top: 20, right: 20, bottom: 100, left: 40},
            width = num*entry_length - margin.left - margin.right,
            height = $('#' + self.parent_div + '> #correlation_plot').height() - margin.top - margin.bottom;

        $('#correlation_plot > #graph').height(height);
        $('#correlation_plot > #graph').width(width);
        $('#correlation_plot > #graph').css({
            'position': 'absolute', 'left': '0%', 'top': margin.top
        });

        $('#' + self.parent_div).append('<div id=\'tooltip\'>test</div>');

        $('#' + self.parent_div + '> #tooltip').css({
            'position': 'absolute', 'visibility': 'hidden', 'z-index': '10'
        });

        var graph_tooltip = d3.select('#' + self.parent_div + '> #tooltip');

        var sortable = [];

        for (i = 0; i < self.correlation_matrix[index].length; i++) {
            if (i !== index) {
                sortable.push([self.matrix_names[i], self.correlation_matrix[index][i]])
            }
        }

        sortable.sort(function(a, b) {return Math.abs(b[1]) - Math.abs(a[1])});

        var y = d3.scale.linear().domain([-1,1]).range([height - offset.top - offset.bottom,0]);
        var x = d3.scale.ordinal().domain(sortable.map(function(d) {return d[0];})).rangeBands([6,width - offset.left - offset.right]);

        var graph = d3.select('#correlation_plot > #graph').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g');
            //.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);

        var matrix_names = self.matrix_names;
        var div_offset = $('#' + self.parent_div + '> #correlation_plot').offset();

        graph.append('g')
            .selectAll('rect')
            .data(sortable)
            .enter()
            .append('rect')
            .style('fill', function(d) { if (d[1] >= 0) { return 'red'; } else { return 'blue'; }})
            .attr('x', function(d) { return offset.left + x(d[0]); })
            .attr('width', x.rangeBand() - 2)
            .attr('y', function(d) { return offset.top + y(Math.max(0,d[1])); })
            .attr('height', function(d) { return Math.abs(y(0) - y(d[1])); })
            .on('mouseover', function (d) {
                d3.select(this).style('stroke', 'black').style('stroke-width', '1');
                var content = (d[0] + '<br/>' + d[1].toFixed(2));
                $(this).tooltip({
                    container: 'body',
                    title: content,
                    html: true,
                    animation: false
                });
                $(this).tooltip('show');
            })
            .on('mouseout', function () {
                d3.select(this).style('stroke', 'none');
            });

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

        var lines = [-1,0,1]

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
    },
    addInputText: function () {
        var self = this;

        $('#' + self.parent_div + '> #search_field').remove();
        $('#' + self.parent_div).append('<input type=\'text\' id=\'search_field\'></input>');

        $('#' + self.parent_div + '> #search_field').attr('placeholder', 'Filter data list');
        $('#' + self.parent_div + '> #search_field').outerWidth('30%');
        $('#' + self.parent_div + '> #search_field').outerHeight('15%');
        $('#' + self.parent_div + '> #search_field').css({
            'position': 'absolute', 'left': '0%', 'top': '0%', 'overflow': 'scroll'
        });

        $('#' + self.parent_div + '> #search_field').on("input", function() {
            value = this.value.toLowerCase();
            if (value === '') {
                self.selectable = self.matrix_names;
            } else {
                self.selectable = $.grep(self.matrix_names, function(n) {
                    return (n.toLowerCase().includes(value));
                });
            }
            self.renderSelectList();
        });
    },
    displayIndividualHeatmap: function () {
        var self = this;

        var selected = $('#' + self.parent_div + '> #select_list option:selected').val();
        $('#flcModal')
            .one('shown.bs.modal', function(){
                var individual_heatmap = new IndividualHeatmap(
                    selected,
                    self.matrix_names,
                    'ind_heatmap_modal_title',
                    'ind_heatmap_modal_body'
                );
                individual_heatmap.render();
            }).modal('show');
    },
    render: function() {
        var self = this;

        self.renderSelectList();
        self.addDisplayButtons();
        self.displayCorrelations();
        self.addInputText();
    },
};
