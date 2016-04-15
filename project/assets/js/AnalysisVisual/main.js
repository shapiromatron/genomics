import _ from 'underscore';
import $ from 'jquery';

import AnalysisOverview from './AnalysisOverview';
import IndividualOverview from './IndividualOverview';


let startup = function(){
    $(document).ready(function(){
        // set environment variables to window
        let config = JSON.parse(document.getElementById('config').textContent);
        _.each(config, (v, k) => window[k] = v);

        // render plots
        $.get(window.plotURL, function(data){
            let overview = new AnalysisOverview($('#visual_panel_1'), data),
                individual_overview = new IndividualOverview($('#visual_panel_2'), data);
            overview.render();
            individual_overview.render();
        });

        $.get(window.ksURL + '?id=123', function(d){
            console.log(d);
        });
    });
};

export default startup;
