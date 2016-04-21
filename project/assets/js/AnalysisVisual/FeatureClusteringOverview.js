import $ from 'jquery';
import d3 from 'd3';


class FeatureClusteringOverview{

    constructor(el, data) {
        this.el = el;
        this.matrix_names = data['matrix_names'];
        this.feature_clusters = data['feature_clusters'];
        this.feature_vectors = data['feature_vectors'];
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
        var k_values = [];
        for(var i=0; i<k; i++){
            k_values.push([]);
        }
        for(var i=0; i<this.feature_clusters[k]['labels'].length; i++){
            var label = this.feature_clusters[k]['labels'][i];
            k_values[label].push(this.feature_vectors[i]);
        }
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

        console.log(cluster_sizes);

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

        console.log(total_entries);
        console.log(entry_count);
    }

    render() {
        this.drawHeatmap(2);
    }
}


export default FeatureClusteringOverview;
