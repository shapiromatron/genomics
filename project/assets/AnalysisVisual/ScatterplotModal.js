import $ from 'jquery';
import d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';

import Loading from '../AnalysisForm/components/Loading';


class ScatterplotModal {

    constructor (idx, idy, modal_title, modal_body) {
        this.idx = idx;
        this.idy = idy;
        this.modal_title = modal_title;
        this.modal_body = modal_body;
    }

    url() {
        return `${window.scatterplotURL}?idx=${this.idx}&idy=${this.idy}`;
    }

    renderHeader(){
        let Header = function(){
            return <p>Scatterplot comparison</p>;
        };
        ReactDOM.render(
            <Header />,
            this.modal_title.get(0)
        );
    }

    renderLoading(data){
        ReactDOM.render(
            <Loading />,
            this.modal_body.get(0)
        );
    }
    renderContent(data) {

        var $el = this.modal_body,
            margin = {top: 20, right: 10, bottom: 50, left: 70},
            width = $el.width() - margin.left - margin.right,
            height = $el.height() - margin.top - margin.bottom,
            x = d3.scale.sqrt().range([0, width]),
            y = d3.scale.sqrt().range([height, 0]),
            xAxis, yAxis, svg;

        // clear body and set resize handler
        $el.empty();

        // build scatterplot
        xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        svg = d3.select($el[0]).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${ margin.left}, ${margin.top})`);

        x.domain(d3.extent(data, function(d) { return d.x; })).nice();
        y.domain(d3.extent(data, function(d) { return d.y; })).nice();

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
            .append('text')
            .attr('class', 'label')
            .attr('x', width)
            .attr('y', -6)
            .style('text-anchor', 'end')
            .text(this.idx);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .append('text')
            .attr('class', 'label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(this.idy);

        svg.selectAll('.dot')
            .data(data)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('r', 3.5)
            .attr('cx', (d) => x(d.x))
            .attr('cy', (d) => y(d.y))
            .style('fill', '#4682B4')
            .style('fill-opacity', 0.5)
            .on('mouseover', function(d){
                let txt = `${d.label}<br>x: ${d.x}<br>y: ${d.y}`;
                $(this).tooltip({
                    container: 'body',
                    title: txt,
                    html: true,
                    animation: false,
                }).tooltip('show');
            })
            .on('mouseoff', function(d){
                $(this).tooltip('destroy');
            });
    }

    dataConversion(d) {
        return {
            label: d.label,
            x: +d.x,
            y: +d.y,
        };
    }

    render() {
        this.renderHeader();
        this.renderLoading();

        d3.csv(
            this.url(),
            this.dataConversion,
            (err, data) => this.renderContent(data)
        );
    }

}

export default ScatterplotModal;
