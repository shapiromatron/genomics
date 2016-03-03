var AnalysisOverview = function(data, parent_div) {
    this.dendrogram = data['dendrogram'];
    this.cluster_members = data['cluster_members'];
    this.cluster_display = data['max_abs_correlation_values'];
    this.correlation_matrix = data['correlation_matrix'];
    this.matrix_names = data['matrix_names'];
    this.cluster_medoids = data['cluster_medoids'];
    this.parent_div = parent_div;
};
AnalysisOverview.prototype = {
    drawHeatmap: function() {
        var self = this;

        //Remove heatmap div if there; append heatmap div
        $('#' + self.parent_div + '> #heatmap').remove();
        $('#' + self.parent_div).append('<div id=\'heatmap\'></div>');

        //Add attributes, style to div
        $('#' + self.parent_div + '> #heatmap').height('80%');
        $('#' + self.parent_div + '> #heatmap').width('60%');
        $('#' + self.parent_div + '> #heatmap').css({
            'position': 'absolute', 'left': '40%', 'top': '20%'
        });

        //Draw SVGs
        var height = $('#' + self.parent_div + '> #heatmap').height();
        var width = $('#' + self.parent_div + '> #heatmap').width();

        var col_number = self.cluster_display[0].length;
        var row_number = self.cluster_display.length;

        var cell_height = height/row_number;
        var cell_width = width/col_number;

        var colorScale = d3.scale.linear()
            .domain([-1, 0, 1])
            .range(['blue', 'white', 'red']);

        var svg = d3.select('#' + self.parent_div + '> #heatmap')
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        var cluster_members = self.cluster_members;
        var cluster_medoids = self.cluster_medoids;

        svg.append('g')
            .selectAll('g')
            .data(self.cluster_display)
            .enter()
            .append('g')
            .selectAll('rect')
            .data( function(d,i,j) { return d; } )
            .enter()
            .append('rect')
            .text( function(d,i,j) { return d; } )
            .attr('x', function(d,i,j) { return (i * cell_width); })
            .attr('y', function(d,i,j) { return (j * cell_height); })
            .attr('width', function(d) { return cell_width; })
            .attr('height', function(d) { return cell_height; })
            .style('fill', function(d) { return colorScale(d); })
            .on('mouseover', function (d, i, j) {
                d3.select(this).style('stroke', 'black').style('stroke-width', '1');
                if (cluster_members[i].length === 1) {
                    var clust_1 = cluster_members[i][0];
                } else {
                    var clust_1 = '(' + cluster_members[i].length + ') ' + cluster_medoids[i];
                };
                if (cluster_members[j].length === 1) {
                    var clust_2 = cluster_members[j][0];
                } else {
                    var clust_2 = '(' + cluster_members[j].length + ') ' + cluster_medoids[j];
                };
                var content = (clust_1 + '<br/>' + clust_2 + '<br/>' + d.toFixed(2));
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
    },
    writeVertNames: function () {
        var self = this;

        //Remove heatmap div if there; append heatmap div
        $('#' + self.parent_div + '> #vert_names').remove();
        $('#' + self.parent_div).append('<div id=\'vert_names\'></div>');

        //Add attributes, style to div
        $('#' + self.parent_div + '> #vert_names').height('18%');
        $('#' + self.parent_div + '> #vert_names').width('60%');
        $('#' + self.parent_div + '> #vert_names').css({
            'position': 'absolute', 'left': '40%', 'top': '1%', 'overflow': 'hidden'
        });

        //Draw SVGs
        var height = $('#' + self.parent_div + '> #vert_names').height();
        var width = $('#' + self.parent_div + '> #vert_names').width();

        var row_number = self.cluster_members.length;

        var svg = d3.select('#' + self.parent_div + '> #vert_names')
            .append('svg')
            .attr('height', height)
            .attr('width', width)

        var cluster_medoids = self.cluster_medoids;

        svg.append('g')
            .selectAll('text')
            .data(self.cluster_members)
            .enter()
            .append('text')
            .text(function(d,i) { if (d.length > 1) {return '(' + d.length + ') ' + cluster_medoids[i];} else {return d[0];}})
            .attr('x', function(d,i) {return (((0.5/row_number)*width) + i*(width/row_number)); })
            .attr('y', 0)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '8px')
            .attr('fill', 'black')
            .attr('transform', function(d,i) {return 'rotate(90 ' + (((0.5/row_number)*width) + i*(width/row_number)) + ',' + 0 +')';})
            .style('dominant-baseline', 'middle');
    },
    writeRowNames: function() {
        var self = this;

        //Remove heatmap div if there; append heatmap div
        $('#' + self.parent_div + '> #row_names').remove();
        $('#' + self.parent_div).append('<div id=\'row_names\'></div>');

        //Add attributes, style to div
        $('#' + self.parent_div + '> #row_names').height('80%');
        $('#' + self.parent_div + '> #row_names').width('18%');
        $('#' + self.parent_div + '> #row_names').css({
            'position': 'absolute', 'left': '21%', 'top': '20%', 'overflow': 'hidden'
        });

        //Draw SVGs
        var height = $('#' + self.parent_div + '> #row_names').height();
        var width = $('#' + self.parent_div + '> #row_names').width();

        var row_number = self.cluster_members.length;

        var svg = d3.select('#' + self.parent_div + '> #row_names')
            .append("svg")
            .attr("height", height)
            .attr("width", width);

        var cluster_medoids = self.cluster_medoids;

        svg.append("g")
            .selectAll("text")
            .data(self.cluster_members)
            .enter()
            .append("text")
            .text(function(d,i) { if (d.length > 1) {return '(' + d.length + ') ' + cluster_medoids[i];} else {return d[0];}})
            .attr("x", 0)
            .attr("y", function(d,i) {return (((0.5/row_number)*height) + i*(height/row_number)); })
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .attr("fill", "black")
            .style("dominant-baseline", "middle");
    },
    writeDendrogram: function() {
        var self = this;

        //Remove heatmap div if there; append heatmap div
        $('#' + self.parent_div + '> #dendrogram').remove();
        $('#' + self.parent_div).append('<div id=\'dendrogram\'></div>');

        //Add attributes, style to div
        $('#' + self.parent_div + '> #dendrogram').height('80%');
        $('#' + self.parent_div + '> #dendrogram').width('20%');
        $('#' + self.parent_div + '> #dendrogram').css({
            'position': 'absolute', 'left': '0%', 'top': '20%', 'overflow': 'hidden'
        });

        var line_coords = [];

        var x_max = parseFloat(Math.max(...[].concat.apply([],self.dendrogram['dcoord'])));
        var y_max = parseFloat(Math.max(...[].concat.apply([],self.dendrogram['icoord'])));

        var x_min = parseFloat(Math.min(...[].concat.apply([],self.dendrogram['dcoord'])));
        var y_min = parseFloat(Math.min(...[].concat.apply([],self.dendrogram['icoord'])));

        var height = $('#' + self.parent_div + '> #dendrogram').height();
        var width = $('#' + self.parent_div + '> #dendrogram').width();

        var leaf_num = self.dendrogram['leaves'].length;

        for (var i in self.dendrogram['dcoord']) {
            for (var j in [0, 1, 2]) {
                line_coords.push({
                    y1: ((0.5/leaf_num)*height)+((parseFloat(self.dendrogram['icoord'][i][j])-y_min)/(y_max-y_min))*(height*((leaf_num-1)/leaf_num)),
                    y2: ((0.5/leaf_num)*height)+((parseFloat(self.dendrogram['icoord'][i][parseInt(j)+1])-y_min)/(y_max-y_min))*(height*((leaf_num-1)/leaf_num)),
                    x1: width-((parseFloat(self.dendrogram['dcoord'][i][j])-x_min)/(x_max-x_min))*width,
                    x2: width-((parseFloat(self.dendrogram['dcoord'][i][parseInt(j)+1])-x_min)/(x_max-x_min))*width
                });
            }
        }

        var svg = d3.select('#' + self.parent_div + '> #dendrogram')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        svg.append('g')
            .selectAll('line')
            .data(line_coords)
            .enter()
            .append('line')
            .attr('x1', function(d) { return d.x1; })
            .attr('x2', function(d) { return d.x2; })
            .attr('y1', function(d) { return d.y1; })
            .attr('y2', function(d) { return d.y2; })
            .style('stroke', 'black')
            .style('stroke-width', 1);
    },
    drawLegend: function() {
        var self = this;

        //Remove heatmap div if there; append heatmap div
        $('#' + self.parent_div + '> #legend').remove();
        $('#' + self.parent_div).append('<div id=\'legend\'></div>');

        //Add attributes, style to div
        $('#' + self.parent_div + '> #legend').height('5%');
        $('#' + self.parent_div + '> #legend').width('20%');
        $('#' + self.parent_div + '> #legend').css({
            'position': 'absolute', 'left': '10%', 'top': '8%', 'overflow': 'visible'
        });

        var height = $('#' + self.parent_div + '> #legend').height(),
        width = $('#' + self.parent_div + '> #legend').width();

        var svg = d3.select('#' + self.parent_div + '> #legend')
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
            .attr('gradientUnits', 'userSpaceOnUse')

        gradient
            .append('stop')
            .attr('offset', '0')
            .attr('stop-color', 'blue')

        gradient
            .append('stop')
            .attr('offset', '0.5')
            .attr('stop-color', 'white')

        gradient
            .append('stop')
            .attr('offset', '1')
            .attr('stop-color', 'red')

        svg.append('rect')
            .attr('width', width)
            .attr('height', 0.5*height)
            .attr('x', '0')
            .attr('y', 0.5*height)
            .attr('fill', 'url(#gradient)')
            .attr('stroke', 'black')
            .attr('stroke-width', '1');

        var legend_lines = [
            {text: '-1', position: 0},
            {text: '0', position: 0.5*width},
            {text: '1', position: width}
        ];

        svg.append('g')
            .selectAll('line')
            .data(legend_lines)
            .enter()
            .append('line')
            .attr('x1', function(d) {return d.position;})
            .attr('x2', function(d) {return d.position;})
            .attr('y1', 0.3*height)
            .attr('y2', 0.5*height)
            .style('stroke', 'black')
            .style('stroke-width', 1);

        svg.append('g')
            .selectAll('text')
            .data(legend_lines)
            .enter()
            .append('text')
            .text(function(d) { return d.text;})
            .attr('x', function(d) {return d.position;})
            .attr('y', 0.25*height)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .style('text-anchor', 'middle');
    },
    render: function() {
        this.drawHeatmap();
        this.writeRowNames();
        this.writeVertNames();
        this.writeDendrogram();
        this.drawLegend();
    },
};
