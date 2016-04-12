import React from 'react';
import { Link } from 'react-router';

import urls from 'constants/urls';

import BreadcrumbBar from './BreadcrumbBar';
import Loading from './Loading';
import CompleteTable from './Analysis/CompleteTable';
import RunningTable from './Analysis/RunningTable';


class Dashboard extends React.Component {

    renderDashboard () {
        if (!this.props.isLoaded) return <Loading />;

        let running = this.props.analysis.items.filter((d) => d.end_time === null);
        let complete = this.props.analysis.items.filter((d) => d.end_time !== null);

        return (
            <div className='row'>
                <div className='col-sm-10'>
                    <h2>Completed analyses</h2>
                    <CompleteTable objects={complete} />
                    <h2>Analyses currently running</h2>
                    <RunningTable objects={running} />
                </div>
                <div className='col-sm-2'>
                    <ul className="pull-right nav nav-pills nav-stacked">
                        <li>
                            <Link className="pill" to={urls.data_management.url}>Manage data</Link>
                        </li>
                        <li>
                            <Link className='pill' to={`${urls.analysis.url}create/`}>Proceed to run setup</Link>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    render(){
        return (
            <div>
                <BreadcrumbBar paths={[urls.dashboard]} />
                {this.renderDashboard()}
            </div>
        );
    }
}

Dashboard.propTypes = {
    isLoaded: React.PropTypes.bool,
    analysis: React.PropTypes.object,
};

export default Dashboard;
