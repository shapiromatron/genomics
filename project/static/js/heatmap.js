Heatmap = function(data){
    this.data = data;
    window.data = data;
    this.render();
}
Heatmap.prototype = {
    render: function(){
        this.setData();
        this.renderDOM();
    },
    setData: function(){

        //define a color scale using the min and max expression values
        var dRange = d3.extent(_.flatten(this.data.matrix)),
            colorScale = d3.scale.linear()
                .domain([dRange[0], d3.mean(dRange), dRange[1]])
                .range(["blue", "white", "red"]);

        var nRows = this.data.matrix[0].length,
            nCols = this.data.matrix.length;

        // height / width of cells in heatmap
        var h = Math.min(Math.floor(1200 / nCols), 10),
            w = h;

        //attach a SVG element to the document's body
        var svg = d3.select("#heatmap")
                .append("svg")
                .attr("width",  (w * nCols))
                .attr("height", (h * nRows))
                .style('position', 'relative')
                .style('top', 0)
                .style('left', 0);

        var data = _.flatten(this.data.matrix),
            rows = _.flatten(Array.apply(null, Array(nCols)).map(function(){return _.range(nRows)}))
            cols = _.flatten(Array.apply(null, Array(nRows)).map(function(){return _.range(nCols)})).sort(function(a,b){return a-b;});

        dataset = [];
        for(var i=0; i<data.length; i++){
            dataset.push({
                "d": data[i],
                "r": rows[i],
                "c": cols[i],
                "fill": colorScale(data[i])
            });
        }

        //generate heatmap rows
        var gGrid = svg.append("g")
            .attr('class', 'grects');

        var heatmapRects = gGrid
         .selectAll(".grects")
         .data(dataset)
            .enter().append("svg:rect")
                .attr('width', w)
                .attr('height', h)
                .attr('x', function(d) {return (d.c * w);})
                .attr('y', function(d) {return (d.r * h);})
                .style('fill', function(d) {return d.fill;});

        // expression value label
        // var expLab = d3.select("body")
        //  .append('div')
        //  .style('height',23)
        //  .style('position','absolute')
        //  .style('background','FFE53B')
        //  .style('opacity',0.8)
        //  .style('top',0)
        //  .style('padding',10)
        //  .style('left',40)
        //  .style('display','none');

        // //heatmap mouse events
        // heatmapRow
        //  .on('mouseover', function(d,i) {
        //     d3.select(this)
        //        .attr('stroke-width',1)
        //        .attr('stroke','black')

        //     output = '<b>' + rows[i] + '</b><br>';
        //     for (var j = 0 , count = data[i].length; j < count; j ++ ) {
        //        output += data[i][j][0] + ", ";
        //     }
        //     expLab
        //        .style('top',(i * h))
        //        .style('display','block')
        //        .html(output.substring(0,output.length - 3));
        // })
        // .on('mouseout', function(d,i) {
        //  d3.select(this)
        //     .attr('stroke-width',0)
        //     .attr('stroke','none')
        //  expLab
        //     .style('display','none')
        // });
    },
    renderDOM: function(){

    }
}
