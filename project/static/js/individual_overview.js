var IndividualOverview = function(el, data) {
    this.el = el;
    this.dendrogram = data['dendrogram'];
    this.cluster_members = data['cluster_members'];
    this.cluster_display = data['max_abs_correlation_values'];
    this.correlation_matrix = data['correlation_matrix'];
    this.matrix_ids = data['matrix_ids'];
    this.matrix_names = data['matrix_names'];
    this.cluster_medoids = data['cluster_medoids'];

    /*
    this.name_to_id = new Object();
    for(var i=0;i<this.matrix_names.length;i++){
        this.name_to_id[this.matrix_names[i]]=this.matrix_ids[i];
    }
    */
    //this.names_crosswalk = _.object(this.matrix_ids, this.matrix_names);
    //this.selectable = data['matrix_names'];
};
IndividualOverview.prototype = {
    renderSelectList: function() {
        var selectable = this.matrix_names;

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

        //var self = this;
        //console.log('renderSelectList called!!');
        //console.log(this.selectable);

        //Remove heatmap div if there; append heatmap div
        this.el.find('#select_list').remove();

        var select_list = $('<select id="select_list"></select>')
            .attr({
                'size': '12'
            })
            .css({
                'height': '40%',
                'weight': '30%',
                'font-size': '8px',
                'position': 'absolute',
                'top': '20%'
            })
            .change(this.displayCorrelations.bind(this))
            .appendTo(this.el);
        /*
        $('#' + self.parent_div).append('<select id=\'select_list\'></select>');

        //Add attributes, style to div
        $('#' + self.parent_div + '> #select_list').height('40%');
        $('#' + self.parent_div + '> #select_list').width('30%');
        $('#' + self.parent_div + '> #select_list').attr('size', '12');
        $('#' + self.parent_div + '> #select_list').css({
            'font-size': '8px', 'position': 'absolute', 'top': '20%'
        });
        */

        /*
        var names_crosswalk = this.names_crosswalk;

        var sort_list = d3.select(select_list.get(0))
            .selectAll('option')
            .data(_.pairs(names_crosswalk))
            .enter()
            .append('option')
            .text(function(d) {return d[1];})
            .attr('value', function(d) {return d[0];});
        */
        addOptions(this.el, selectable);

        select_list[0].selectedIndex = 0;

        var matrix_names = this.matrix_names;
        var selectable = this.selectable;
        var el = this.el;

        this.el.find('#search_field').remove();

        var search_field = $('<input></input>')
            .attr({
                'type': 'text',
                'id': 'search_field',
                'placeholder': 'Filter data list',
                'outerWidth': '30%',
                'outerHeight': '15%'
            }).css({
                'position': 'absolute',
                'left': '0%',
                'top': '0%',
                'overflow': 'scroll'
            })

            .on('input', function() {
                value = this.value.toLowerCase();
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
    },
    addDisplayButtons: function() {

        // display new correlations whenver field changes
        //$('#' + this.parent_div + '> #select_list')
        /*
        this.el.find('#select_list')
            .change(this.displayCorrelations.bind(this));
        */

        //Remove heatmap div if there; append heatmap div
        this.el.find('#display_heatmap').remove();

        var display_heatmap = $('<button>Display individual heatmap</button>')
            .attr({
                'type': 'button',
                'class': 'btn btn-primary'
            }).css({
                'position': 'absolute',
                'left': '0%',
                'top': '80%',
                'width': '30%'
            }).click(
                this.displayIndividualHeatmap.bind(this)
            ).appendTo(this.el);
        /*
        $('#' + this.parent_div)
            .remove('#display_heatmap')
            .append(
                '<button id=\'display_heatmap\' type=\'button\' class=\'btn btn-primary\'>Display individual heatmap</button>'
            );
        */

        // on click display heatmap
        /*
        $('#' + this.parent_div + '> #display_heatmap').css({
            position: 'absolute',
            left: '0%',
            top: '80%',
            width: '30%',
        }).click(
            this.displayIndividualHeatmap.bind(this)
        );
        */
    },
    displayCorrelations: function() {
        //var self = this;

        //Remove correlation_plot div if there; append correlation_plot div
        //$('#' + self.parent_div + '> #correlation_plot').remove();
        this.el.find('#correlation_plot').remove();
        var correlation_plot = $('<div id="correlation_plot"></div>')
        .css({
            'height': '100%',
            'width': '68%',
            'position': 'absolute',
            'left': '32%',
            'top': '0%',
            'overflow': 'scroll'
        }).appendTo(this.el);
        //$('#' + self.parent_div).append('<div id=\'correlation_plot\'></div>');

        //Add attributes, style to div
        /*
        $('#' + self.parent_div + '> #correlation_plot').height('100%');
        $('#' + self.parent_div + '> #correlation_plot').width('68%');
        $('#' + self.parent_div + '> #correlation_plot').css({
            'position': 'absolute', 'left': '32%', 'top': '0%', 'overflow': 'scroll'
        });
        */
        //$('#' + self.parent_div + '> #correlation_plot').append('<div id=\'graph\'></div>');

        var num = this.matrix_names.length - 1;
        var entry_length = 20;

        //var index = $('#' + self.parent_div + '> #select_list').find('option:selected').index();
        //var select = this.el.find('#select_list');
        //console.log(select.options[select.selectedIndex].value);
        //console.log(this.el.find('#select_list').find('option:selected').text());
        var index = this.matrix_names.indexOf(this.el.find('#select_list').find('option:selected').text());
        //var index = 0;

        var margin = {top: 0, right: 20, bottom: 20, left: 20},
            offset = {top: 20, right: 20, bottom: 100, left: 40},
            width = num*entry_length - margin.left - margin.right,
            //height = $('#' + self.parent_div + '> #correlation_plot').height() - margin.top - margin.bottom;
            height = this.el.find('#correlation_plot').height() - margin.top - margin.bottom;

        var graph = $('<div id="graph"></div>')
            .css({
                'height': height,
                'width': width,
                'position': 'absolute',
                'left': '0%',
                'top': margin.top
            }).appendTo(this.el.find('#correlation_plot'));
        /*
        $('#correlation_plot > #graph').height(height);
        $('#correlation_plot > #graph').width(width);
        $('#correlation_plot > #graph').css({
            'position': 'absolute', 'left': '0%', 'top': margin.top
        });
        */

        /*
        var graph_tooltip = $('<div id=\'tooltip\'>test</div>')
            .css({
                'position': 'absolute',
                'visibilty': 'hidden',
                'z-index': '10'
            }).appendTo(this.el);
        */
        /*
        $('#' + self.parent_div).append('<div id=\'tooltip\'>test</div>');

        $('#' + self.parent_div + '> #tooltip').css({
            'position': 'absolute', 'visibility': 'hidden', 'z-index': '10'
        });

        var graph_tooltip = d3.select('#' + self.parent_div + '> #tooltip');
        */
        var sortable = [];
        var correlation_matrix = this.correlation_matrix;
        var matrix_names = this.matrix_names;

        for (i = 0; i < correlation_matrix[index].length; i++) {
            if (i !== index) {
                sortable.push([matrix_names[i], correlation_matrix[index][i]])
            }
        }

        sortable.sort(function(a, b) {return Math.abs(b[1]) - Math.abs(a[1])});

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
            //.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);

        var div_offset = this.el.find('#correlation_plot').offset();
        //var div_offset = $('#' + self.parent_div + '> #correlation_plot').offset();

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

        var matrix_names = this.matrix_names;
        var selectable = this.selectable;
        renderSelectList = this.renderSelectList.bind(this);

        this.el.find('#search_field').remove();

        var search_field = $('<input></input>')
            .attr({
                'type': 'text',
                'id': 'search_field',
                'placeholder': 'Filter data list',
                'outerWidth': '30%',
                'outerHeight': '15%'
            }).css({
                'position': 'absolute',
                'left': '0%',
                'top': '0%',
                'overflow': 'scroll'
            }).on('input', function() {
                value = this.value.toLowerCase();
                if (value === '') {
                    selectable = matrix_names;
                } else {
                    selectable = $.grep(matrix_names, function(n) {
                        return (n.toLowerCase().includes(value));
                    });
                }
                renderSelectList.call();
            }).appendTo(this.el);
        /*
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
        */
    },
    displayIndividualHeatmap: function () {
        //var self = this;
        var name = this.el.find('#select_list').find('option:selected').text(),
            names = this.matrix_names,
            ids = this.matrix_ids,
            selected = names.indexOf(name),
            matrix_id = ids[selected],
            modalTitle = $('#ind_heatmap_modal_title'),
            modalBody = $('#ind_heatmap_modal_body');

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
                    modalBody
                );
                individual_heatmap.render();
            }).modal('show');
    },
    render: function() {
        this.renderSelectList();
        this.addDisplayButtons();
        this.displayCorrelations();
        //this.addInputText();
    },
};
