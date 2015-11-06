import React from 'react';
import ReactDOM from 'react-dom';

import RunHeader from './components/RunHeader';


if ($('#react-main').length>0){
    var data = {
        name: "Thomas",
        url_update: "/",
        url_delete: "/s"
    }
    ReactDOM.render(
        <RunHeader data={data}/>,
        document.getElementById('react-main')
    );
}
