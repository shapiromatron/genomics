from collections import OrderedDict
import seaborn as sns
from matplotlib import cm
from matplotlib.colors import rgb2hex, Normalize

from bokeh.plotting import figure
from bokeh.resources import CDN
from bokeh.embed import components
from bokeh.models import HoverTool, ColumnDataSource

import numpy as np


def get_gradient(arr):
    gradient = np.zeros(arr.size, dtype="S7")
    normalizer = Normalize()
    norm_arr = normalizer(arr).tolist()
    cmap = sns.diverging_palette(220, 20, sep=20, as_cmap=True)
    rgbs = cmap(norm_arr)
    for i, rbg in enumerate(rgbs):
        gradient[i] = rgb2hex(rbg)
    print set(gradient.tolist())
    return gradient


def fixed_chart(object):
    data = object.get_heatmap_dataset(aslist=False)
    matrix = data.get('matrix')
    shape = matrix.shape
    xvals = ["x{}".format(i+1) for i in xrange(shape[0])]
    yvals = ["y{}".format(i+1) for i in xrange(shape[1])]
    xs = np.tile(xvals, shape[1])
    ys = np.repeat(yvals, shape[0])
    vals = matrix.ravel()
    colors = get_gradient(vals)

    source = ColumnDataSource(
        data=dict(
            xs=xs.tolist(),
            ys=ys.tolist(),
            colors=colors.tolist(),
            val=vals.tolist()))

    p = figure(
        title=None,
        x_range=xvals,
        y_range=list(reversed(yvals)),
        x_axis_location="below",
        plot_width=1000,
        plot_height=200,
        toolbar_location="right",
        tools="reset,box_zoom,save,hover")

    p.rect("xs", "ys", 1, 1, source=source, color="colors")

    p.grid.grid_line_color = None
    p.axis.axis_line_color = None
    p.axis.major_tick_line_color = None
    p.axis.major_label_text_font_size = "0.5em"
    p.axis.major_label_standoff = 3
    p.xaxis.major_label_orientation = np.pi/4
    p.axis.visible = None

    hover = p.select(dict(type=HoverTool))
    hover.tooltips = OrderedDict([
        ('value', '@val'),
        ('color', '@colors'),
    ])

    script, content = components(p, CDN)
    return {"bokeh_script": script, "bokeh_content": content}
