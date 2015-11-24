import React from 'react';
import d3 from 'd3';


var RunHeader = React.createClass({
  render: function(){
    var data = this.props.data;
    console.log(d3.selectAll('div'));
    return (
      <h1>
        Welcome, <span>{data.name}</span>. My name is <span>{data.name}</span>.
        <div className="btn-group pull-right">
          <button type="button"
                  className="btn btn-primary dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false">
            Actions <span className="caret"></span>
          </button>
          <ul className="dropdown-menu">
            <li><a href={data.url_update}>Update</a></li>
            <li><a href={data.url_delete}>Delete</a></li>
          </ul>
        </div>
      </h1>
    );
  }
});

export default RunHeader;
