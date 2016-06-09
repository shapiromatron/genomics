#### Analysis visualization:

##### Data set clustering:

###### Without a sort vector:

Data sets were hierarchically clustered based on Spearman rho values. Clustering results are shown as a dendrogram on the left side of the top panel. Rho values are reported by color in an *n*-by-*n* heatmap, where *n* is the number of data sets.  Rho values may also be found in tooltips when hovering over individual cells.  By clicking on a cell, a scatterplot will be generated showing the points used to derive the Spearman rho value.  A drop-down menu allows for individual values to be investigated on a bin-by-bin basis.

In the bottom panel, individual data sets may be selected in the list on the left.  Once selected, the bar plot on the right will be populated with pairwise Spearman correlation values for each other data set.  After clicking on ‘Display individual heatmap’, a window will pop up detailing the read coverage for that data set over the feature list.

In the pop up, a heatmap of read coverage over the user-specified genomic window is shown on the right. In the upper-left panel, a plot of bin-average read coverage is shown.  In the mid-left panel, a plot of bin-average read coverage over quartiles is shown.  Quartiles are generated respecting the sort order of the read coverage heatmap.  The sort order of heatmap may be changed using the lower-left panel.  By selecting a data set and clicking ‘Reorder heatmap’ the heatmap will be re-ordered to reflect read coverage of the selected data set in descending order, ie genomic features with greater read coverage in the selected data set will be on top.  The quartile plot will change upon re-ordering of the read coverage heatmap.  The p-value in the upper-left corner of the quartile plot is derived from application of the four-sample Anderson-Darling test to the quartile plots and reflects the null hypothesis that quartiles are sampled from populations that are identical.

###### With a sort vector:

Data sets were hierarchically clustered.  For each data set, the read coverage sum across each bin found.  Then, for each given bin, the Spearman rho value is found between the bin read coverage sums and the sort vector.  For each data set, these correlation values are concatenated in a single data vector.  The data sets are hierarchically clustered using the pairwise Euclidean distance between each data set.  Rho values are displayed by color gradient in a *n*-by-*m* heatmap, where *n* is the number of data sets and *m* is the number of genomic bins.  By clicking on a cell, a scatterplot will be generated showing the points used to the derive the Spearman rho value.

In the bottom panel, individual data sets may be selected in the list on the left.  Once selected, the bar plot on the right will be populated with Spearman correlation values for each genomic bin.  After clicking on ‘Display individual heatmap’, a window will pop up detailing the read coverage for that data set over the feature list.

In the pop up, a heatmap of read coverage over the user-specified genomic window is shown on the right. In the upper-left panel, a plot of bin-average read coverage is shown.  In the mid-left panel, a plot of bin-average read coverage over quartiles is shown.  Quartiles are generated respecting the sort order of the read coverage heatmap.  The sort order of heatmap may be changed using the lower-left panel.  By selecting a data set and clicking ‘Reorder heatmap’ the heatmap will be re-ordered to reflect read coverage of the selected data set in descending order, i.e. genomic features with greater read coverage in the selected data set will be on top.  The quartile plot will change upon re-ordering of the read coverage heatmap.  The p-value in the upper-left corner of the quartile plot is derived from application of the four-sample Anderson-Darling test to the quartile plots and reflects the null hypothesis that quartiles are sampled from populations that are identical.

##### Feature clustering:

Genomic features are clustered using *k*-means clustering. For each genomic feature, sum of the read coverage for each data set is found. These sums are then normalized such that each value is in terms of units variance. These normalized sums are concatenated into data vectors for each genomic feature. *k*-means clustering is then performed on these data vectors.  Centroids are initialized by randomly selecting individual data vectors. *k*-means clustering is iteratively performed for *k* values 2 to 10.

In the 'Feature clustering' view, clustering results are shown on the heatmap in the right panel.  Here, each row corresponds to a genomic feature, and each column corresponds to a data set. In each cell, the color represents the read coverage at a genomic feature for a data set after upper-quartile normalization.  Columns are ordered based on hierarchical clustering results with a dendrogram at the top of the panel. Bars on the left side of the panel reflect cluster membership.

In the left panel, *k* values may be selected from a drop-down list.  Members of the selected cluster are displayed in a list at the bottom of the left panel.  If selected, a genomic feature will be indicated in the heatmap by a black arrow.  Also, the values of the selected genomic feature will be displayed on the centroid chart in the bottom panel.

In the bottom panel, a two-dimensional plot displays read coverage values for cluster centroids. Values are upper-quartile normalized.  If a genomic feature is selected in the upper panel, read coverage values for that feature will be plot as a black line.
