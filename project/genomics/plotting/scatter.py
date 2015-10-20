from bokeh.plotting import figure
from bokeh.resources import CDN
from bokeh.embed import components

import numpy as np


def simple_chart():
    p = figure()
    mean = [0, 0]
    cov = [[1, 0], [0, 100]]
    x, y = np.random.multivariate_normal(mean, cov, 5000).T
    p.circle(x, y)
    script, content = components(p, CDN)
    return {"bokeh_script": script, "bokeh_content": content}
