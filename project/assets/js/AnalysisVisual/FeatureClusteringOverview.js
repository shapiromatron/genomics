import $ from 'jquery';
import d3 from 'd3';


class FeatureClusteringOverview{

    constructor(el, data) {
        this.el = el;
        this.matrix_names = data['matrix_names'];
        this.feature_clusters = data['feature_clusters'];
        this.feature_vectors = data['feature_vectors'];
        this.feature_columns = data['feature_columns'];
        this.dendrogram = data['dendrogram'];
        this.matrix_names = data['matrix_names'];
        this.matrix_ids = data['matrix_ids'];
        this.cluster_medoids = data['cluster_medoids'];
        this.cluster_members = data['cluster_members'];
    }

    drawHeatmap(k) {
        // remove existing heatmap
        this.el.find('#heatmap').remove();

        // create heatmap
        var heatmap = $('<canvas id="heatmap"></canvas>')
            .prop({
                'height': 0.80 * this.el.height(),
                'width': 0.60 * this.el.width(),
            })
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '20%',
            })
            .appendTo(this.el);

        // get values to draw heatmap
        var column_order = [];
        for(var i=0; i<this.cluster_members.length; i++){
            column_order.push(this.matrix_ids.indexOf(this.cluster_members[i][0]))
        }

        var k_values = [];
        for(var i=0; i<k; i++){
            k_values.push([]);
        }
        for(var i=0; i<this.feature_clusters[k]['labels'].length; i++){
            var label = this.feature_clusters[k]['labels'][i];
            // k_values[label].push(this.feature_vectors[i]);
            k_values[label].push([])
            for(var j=0; j<column_order.length; j++){
                k_values[label][k_values[label].length-1].push(this.feature_vectors[i][column_order[j]]);
            }
        }
        console.log(k_values);
        // draw heatmap
        var row_number = this.feature_clusters[k]['labels'].length,
            col_number = k_values[0][0].length,
            height = heatmap.height(),
            width = heatmap.width(),
            context = document.getElementById('heatmap').getContext('2d');

        var colorScale = d3.scale.linear()
            .domain([0, 1])
            .range(['white', 'red']);

        var scale_x = width/col_number,
            scale_y = height/row_number;

        context.scale(scale_x, scale_y);

        var row_count = 0;
        for (var cluster = 0; cluster < k_values.length; cluster++) {
            for (var i = 0; i < k_values[cluster].length; i++) {
                for (var j = 0; j < k_values[cluster][i].length; j++) {
                    context.fillStyle=colorScale(k_values[cluster][i][j]);
                    context.fillRect(j,row_count,1,1);
                }
                row_count += 1;
            }
        }

        // remove existing cluster bars
        this.el.find('#heatmap_clusters').remove();

        // add cluster bars
        var heatmap_clusters = $('<div id="heatmap_clusters">')
            .css({
                'height': '80%',
                'width': '3%',
                'position': 'absolute',
                'left': '36%',
                'top': '20%',
            }).appendTo(this.el);

        var cluster_colors = ['red','blue'];
        var cluster_sizes = [];
        var total_entries = this.feature_clusters[k]['labels'].length;
        var entry_count = 0;

        for (var cluster = 0; cluster < k_values.length; cluster++) {
            cluster_sizes.push({'entry':k_values[cluster].length, 'cume':entry_count});
            entry_count += k_values[cluster].length;
        }

        var svg = d3.select(heatmap_clusters.get(0))
            .append('svg')
            .attr('height', heatmap_clusters.height())
            .attr('width', heatmap_clusters.width());

        svg.append('g')
            .selectAll('rect')
            .data(cluster_sizes)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', function(d) { return (d.cume/total_entries)*heatmap_clusters.height(); })
            .attr('width', heatmap_clusters.width())
            .attr('height', function(d) { return (d.entry/total_entries)*heatmap_clusters.height(); })
            .style('fill', function(d, i) { return cluster_colors[i]; })
            .on('mouseover', function (d, i) {
                d3.select(this)
                    .style('stroke', 'black')
                    .style('stroke-width', '1');

                var content = ('Cluster ' + (i+1) + '<br/>' + d.entry + ' entries<br/>');

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
    }

    drawDendrogram() {
        this.el.find('#dendrogram').remove();

        var dendro = $('<div id="dendrogram">')
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '0%',
                'overflow': 'visible',
                'height': '10%',
                'width': '60%',
            }).appendTo(this.el);

        var line_coords = [],
            x_max = parseFloat(Math.max(...[].concat.apply([], this.dendrogram['icoord']))),
            y_max = parseFloat(Math.max(...[].concat.apply([], this.dendrogram['dcoord']))),
            x_min = parseFloat(Math.min(...[].concat.apply([], this.dendrogram['icoord']))),
            y_min = parseFloat(Math.min(...[].concat.apply([], this.dendrogram['dcoord']))),
            height = dendro.height(),
            width = dendro.width(),
            ceiling = 0.05*dendro.height(),
            leaf_num = this.dendrogram['leaves'].length,
            icoords = this.dendrogram['icoord'],
            dcoords = this.dendrogram['dcoord'],
            leafHeight = ((0.5/leaf_num)*width);

        for(var i=0; i<icoords.length; i++){
            for(var j=0; j<3; j++){
                line_coords.push({
                    y1: height-((parseFloat(dcoords[i][j])-y_min)/(y_max-y_min))*(height-ceiling),
                    y2: height-((parseFloat(dcoords[i][j+1])-y_min)/(y_max-y_min))*(height-ceiling),
                    x1: leafHeight+((parseFloat(icoords[i][j])-x_min)/(x_max-x_min))*(width*((leaf_num-1)/leaf_num)),
                    x2: leafHeight+((parseFloat(icoords[i][j+1])-x_min)/(x_max-x_min))*(width*((leaf_num-1)/leaf_num)),
                });
            }
        }

        var svg = d3.select(dendro.get(0))
            .append('svg')
            .attr('width', width)
            .attr('height', height);

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

    writeVertNames() {
        // remove existing
        this.el.find('#vert_names').remove();

        // create new
        var vert = $('<div id="vert_names">')
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '11%',
                'overflow': 'hidden',
                'height': '8%',
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

    render() {
        this.drawHeatmap(2);
        this.drawDendrogram();
        this.writeVertNames();
    }
}


export default FeatureClusteringOverview;
