import _ from 'underscore';
import $ from 'jquery';

import AnalysisOverview from './AnalysisOverview';
import IndividualOverview from './IndividualOverview';
import FeatureClusteringOverview from './FeatureClusteringOverview';


let startup = function(){
    $(document).ready(function(){
        // set environment variables to window
        let config = JSON.parse(document.getElementById('config').textContent);
        _.each(config, (v, k) => window[k] = v);

        // render plots
        $.get(window.plotURL, function(data){

            // create instances for visualization
            let overview = new AnalysisOverview($('#visual_panel_1'), data),
                individual_overview = new IndividualOverview($('#visual_panel_2'), data),
                feature_clust_overview = new FeatureClusteringOverview(
                    $('#visual_panel_1'), $('#visual_panel_2'), data);

            // add buttons for visualization selection
            $('<button>Data set clustering</button>')
                .attr({
                    'type': 'button',
                    'id': 'data_clust_button',
                    'class': 'btn btn-primary',
                }).css({
                    'position': 'absolute',
                    'left': '0%',
                    'top': '0%',
                    'width': '30%',
                }).appendTo('#analysis_selection_panel');
            $('<button>Feature clustering</button>')
                .attr({
                    'type': 'button',
                    'id': 'feature_clust_button',
                    'class': 'btn btn-default',
                }).css({
                    'position': 'absolute',
                    'left': '31%',
                    'top': '0%',
                    'width': '30%',
                }).appendTo('#analysis_selection_panel');

            $('#data_clust_button').click( function() {
                $('#data_clust_button').attr({
                    'class': 'btn btn-primary',
                });
                $('#feature_clust_button').attr({
                    'class': 'btn btn-default',
                });

                $('#visual_panel_1').empty();
                $('#visual_panel_2').empty();

                overview.render();
                individual_overview.render();
            });

            $('#feature_clust_button').click( function() {
                $('#feature_clust_button').attr({
                    'class': 'btn btn-primary',
                });
                $('#data_clust_button').attr({
                    'class': 'btn btn-default',
                });

                $('#visual_panel_1').empty();
                $('#visual_panel_2').empty();

                feature_clust_overview.render();
            });

            overview.render();
            individual_overview.render();
        });

        $.get(window.ksURL + '?id=123', function(d){
            console.log(d);
        });
    });
};

export default startup;
