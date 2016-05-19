import moment from 'moment';

import VisualRoot from 'AnalysisVisual/main';
import AnalysisFormRoot from 'AnalysisForm/main';


if (document.getElementById('visual_panel_1'))
    VisualRoot();

if (document.getElementById('analysis_form'))
    AnalysisFormRoot();

window.moment = moment;
