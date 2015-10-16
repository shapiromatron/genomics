from bokeh.plotting import figure
from bokeh.resources import CDN
from bokeh.embed import components

import numpy as np


def generate_data():
    xx = np.array([-0.51, 51.2])
    yy = np.array([0.33, 51.6])
    means = [xx.mean(), yy.mean()]
    stds = [xx.std() / 3, yy.std() / 3]
    corr = 0.6  # correlation
    covs = [[stds[0]**2, stds[0]*stds[1]*corr],
            [stds[0]*stds[1]*corr, stds[1]**2]]

    m = np.random.multivariate_normal(means, covs, 1000).T
    return m


def simple_chart():
    p = figure()
    p.circle([1, 2], [3, 4])
    script, content = components(p, CDN)
    return {"bokeh_script": script, "bokeh_content": content}
