import $ from 'jquery';
import d3 from 'd3';


class AnalysisOverview{

    constructor(el, data) {
        this.el = el;
        this.dendrogram = data['dendrogram'];
        this.cluster_members = data['cluster_members'];
        this.cluster_display = data['max_abs_correlation_values'];
        this.correlation_matrix = data['correlation_matrix'];
        this.matrix_names = data['matrix_names'];
        this.cluster_medoids = data['cluster_medoids'];
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

        // Draw SVGs
        var height = heatmap.height(),
            width = heatmap.width(),
            col_number = this.cluster_display[0].length,
            row_number = this.cluster_display.length,
            cell_height = height/row_number,
            cell_width = width/col_number,
            cluster_members = this.cluster_members,
            cluster_medoids = this.cluster_medoids;

        var colorScale = d3.scale.linear()
            .domain([-1, 0, 1])
            .range(['blue', 'white', 'red']);

        var svg = d3.select(heatmap.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        svg.append('g')
            .selectAll('g')
            .data(this.cluster_display)
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
                d3.select(this)
                    .style('stroke', 'black')
                    .style('stroke-width', '1');

                var clust_1 = (cluster_members[i].length === 1) ?
                        cluster_members[i][0] :
                        '(' + cluster_members[i].length + ') ' + cluster_medoids[i],
                    clust_2 = (cluster_members[j].length === 1) ?
                        cluster_members[j][0] :
                        '(' + cluster_members[j].length + ') ' + cluster_medoids[j],
                    content = (clust_1 + '<br/>' + clust_2 + '<br/>' + d.toFixed(2));

                $(this).tooltip({
                    container: 'body',
                    title: content,
                    html: true,
                    animation: false,
                }).tooltip('show');

            })
            .on('mouseout', function () {
                d3.select(this)
                    .style('stroke', 'none');
            });

        $('[data-toggle="tooltip"]').tooltip();
    }

    writeVertNames() {
        // remove existing
        this.el.find('#vert_names').remove();

        // create new
        var vert = $('<div id="vert_names">')
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '1%',
                'overflow': 'hidden',
                'height': '18%',
                'width': '60%',
            }).appendTo(this.el);

        //Draw SVGs
        var height = vert.height(),
            width = vert.width(),
            row_number = this.cluster_members.length,
            cluster_medoids = this.cluster_medoids,
            matrix_names = this.matrix_names;

        var svg = d3.select(vert.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        svg.append('g')
            .selectAll('text')
            .data(this.cluster_members)
            .enter()
            .append('text')
            .attr('class', 'heatmapLabelText')
            .text(function(d,i) {
                return (d.length > 1) ?
                    '(' + d.length + ') ' + cluster_medoids[i]:
                    matrix_names[i];
            })
            .attr('x', function(d,i) {
                return (((0.5 / row_number) * width) + i * (width / row_number));
            })
            .attr('y', 0)
            .attr('transform', function(d,i) {
                var rot = (((0.5/row_number)*width) + i*(width/row_number));
                return 'rotate(90 ' + rot + ',0)';
            });
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
            matrix_names = this.matrix_names;

        var svg = d3.select(row_names.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        svg.append('g')
            .selectAll('text')
            .data(this.cluster_members)
            .enter()
            .append('text')
            .attr('class', 'heatmapLabelText')
            .text(function(d,i) {
                return (d.length > 1)?
                    '(' + d.length + ') ' + cluster_medoids[i]:
                    matrix_names[i];
            })
            .attr('x', 0)
            .attr('y', function(d, i) {
                return (((0.5 / row_number) * height) + i * (height / row_number));
            });
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
            x_max = parseFloat(Math.max(...[].concat.apply([], this.dendrogram['dcoord']))),
            y_max = parseFloat(Math.max(...[].concat.apply([], this.dendrogram['icoord']))),
            x_min = parseFloat(Math.min(...[].concat.apply([], this.dendrogram['dcoord']))),
            y_min = parseFloat(Math.min(...[].concat.apply([], this.dendrogram['icoord']))),
            height = dendro.height(),
            width = dendro.width(),
            leaf_num = this.dendrogram['leaves'].length,
            icoords = this.dendrogram['icoord'],
            dcoords = this.dendrogram['dcoord'],
            leafHeight = ((0.5/leaf_num)*height);

        for(var i=0; i<icoords.length; i++){
            for(var j=0; j<3; j++){
                line_coords.push({
                    y1: leafHeight+((parseFloat(icoords[i][j])-y_min)/(y_max-y_min))*(height*((leaf_num-1)/leaf_num)),
                    y2: leafHeight+((parseFloat(icoords[i][parseInt(j)+1])-y_min)/(y_max-y_min))*(height*((leaf_num-1)/leaf_num)),
                    x1: width-((parseFloat(dcoords[i][j])-x_min)/(x_max-x_min))*width,
                    x2: width-((parseFloat(dcoords[i][parseInt(j)+1])-x_min)/(x_max-x_min))*width,
                });
            }
        }

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
            .attr('x1', function(d) { return d.x1; })
            .attr('x2', function(d) { return d.x2; })
            .attr('y1', function(d) { return d.y1; })
            .attr('y2', function(d) { return d.y2; });
    }

    drawLegend() {
        // remove existing
        this.el.find('#legend').remove();

        // create new
        var legend = $('<div id="legend">')
            .css({
                'position': 'absolute',
                'left': '10%',
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
            .attr('x1', function(d) {return d.position;})
            .attr('x2', function(d) {return d.position;})
            .attr('y1', 0.3 * height)
            .attr('y2', 0.5 * height)
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
    }

    render() {
        this.drawHeatmap();
        this.writeRowNames();
        this.writeVertNames();
        this.writeDendrogram();
        this.drawLegend();
    }
}


export default AnalysisOverview;
