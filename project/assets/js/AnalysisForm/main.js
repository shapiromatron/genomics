import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

// import AnalysisRoot from 'AnalysisForm/Root';


let wrapAdditionalSettings = function($el){

    let extra = $('<div>').attr('class', 'hidden');
    $el.find('#div_id_public').closest('.form-group').appendTo(extra);
    $el.find('#div_id_anchor').appendTo(extra);
    $el.find('#div_id_bin_start').appendTo(extra);
    $el.find('#div_id_bin_size').appendTo(extra);
    $el.find('#div_id_bin_number').appendTo(extra);

    let btn = $('<button type="button" class="btn btn-default pull-right" title="Show/hide additional options">'),
        icon = $('<i class="fa fa-plus-square-o"></i>').appendTo(btn);

    btn.click(function(e){
        e.preventDefault();
        if (extra.hasClass('hidden')){
            extra.removeClass('hidden');
            icon.addClass('fa-minus-square-o')
                .removeClass('fa-plus-square-o');
        } else {
            extra.addClass('hidden');
            icon.addClass('fa-plus-square-o')
                .removeClass('fa-minus-square-o');
        }

    });

    let header = $('<h3>')
        .text('Additional settings')
        .append(btn);

    $el.find('#div_id_sort_vector')
        .after(extra)
        .after(header)
        .after('<hr>');

    $el.find('.form-actions').before('<hr>');

};

let renderEncodePicker = function($el){
    let reactEntry = $('<div>');
    $el.find('.form-actions').before(reactEntry);
    // ReactDOM.render(<AnalysisRoot />, reactEntry.get(0));
};

const startup = function(){
    $(document).ready(function(){
        let $el = $('#analysis_form');
        wrapAdditionalSettings($el);
        renderEncodePicker($el);
        $el.fadeIn();
    });
};

export default startup;
