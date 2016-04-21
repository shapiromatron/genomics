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
    }

    render() {
        this.drawHeatmap(2);
    }
}


export default FeatureClusteringOverview;
