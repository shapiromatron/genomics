import ReactDOM from 'react-dom';

import AnalysisRoot from 'main_analysis';
import VisualRoot from 'main_visual';


if (document.getElementById('react-main'))
    ReactDOM.render(AnalysisRoot, document.getElementById('react-main'));

if (document.getElementById('visual_panel_1'))
    VisualRoot();
