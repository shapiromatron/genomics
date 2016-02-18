#!/usr/bin/env python

import click
import numpy
from scipy import stats
from scipy.cluster.hierarchy import linkage, dendrogram
from scipy.spatial.distance import squareform, pdist
import os
import json

class MatrixByMatrix():

    def __init__(self, matrix_list, window_start,
                 bin_number, bin_size, sort_vector):

        #self.input_vector = input_vector
        self.matrix_list = matrix_list
        self.window_start = window_start
        self.bin_number = bin_number
        self.bin_size = bin_size
        self.sort_vector = sort_vector

        #assert os.path.exists(self.input_vector)
        assert isinstance(window_start, int)
        assert isinstance(bin_number, int)
        assert isinstance(bin_size, int)

        if sort_vector:
            assert os.path.exists(self.sort_vector)

        self.execute()

    def readMatrixFiles(self):
        self.matrix_files, self.matrix_names = zip(*self.matrix_list)

    def createSortOrders(self):
        self.sort_orders = []

        for i in range(len(self.matrix_files)):
            matrix_entries = dict()
            index = 0
            with open(self.matrix_files[i]) as f:
                next(f)
                for line in f:
                    matrix_entries[index] = {"feature_id": line.split()[0], "row_sum": sum(map(float, line.strip().split()[1:]))}
                    index += 1
            self.sort_orders.append({"data_set": self.matrix_names[i], "sort_order":sorted(matrix_entries, key=lambda x: (matrix_entries[x]["row_sum"]), reverse=True)})

    def createVectorList(self):
        vector_list = []

        for fn in self.matrix_files:

            matrix = numpy.loadtxt(
                fn, skiprows=1, usecols=tuple(range(1, self.bin_number+1)),
                unpack=True
            )

            vector = numpy.sum(matrix, axis=0)
            vector_list.append(vector)

        return vector_list

    def createCorrelationMatrix(self):
        self.correlation_matrix = []

        if self.sort_vector:
            sort_vector = self.readInSortVector(self.sort_vector)
            for matrix in self.matrix_files:
                self.correlation_matrix.append(
                    self.findVectorMatrixCorr(
                        sort_vector, matrix, self.bin_number
                    )
                )
        else:
            vector_list = self.createVectorList()
            for i in range(len(vector_list)):
                self.correlation_matrix.append([])
                for j in range(len(vector_list)):
                    if i == j:
                        self.correlation_matrix[-1].append(1)
                    else:
                        try:
                            self.correlation_matrix[j][i]
                        except IndexError:
                            self.correlation_matrix[-1].append(stats.spearmanr(vector_list[i], vector_list[j])[0])
                        else:
                            self.correlation_matrix[-1].append(self.correlation_matrix[j][i])

    def createDistanceMatrix(self):
        self.distance_matrix = []

        if self.sort_vector:
            for i in range(len(self.correlation_matrix)):
                self.distance_matrix.append([])
                for j in range(len(self.correlation_matrix)):
                    test_matrix = []
                    test_matrix.append(self.correlation_matrix[i])
                    test_matrix.append(self.correlation_matrix[j])
                    self.distance_matrix[-1].append(pdist(numpy.array(test_matrix), "euclidean")[0])
        else:
            for i in range(len(self.correlation_matrix)):
                self.distance_matrix.append([])
                for j in range(len(self.correlation_matrix[i])):
                    self.distance_matrix[-1].append(1 - self.correlation_matrix[i][j])

    def findMedoids(self):
        self.cluster_medoids = []

        for cluster in self.cluster_members:
            if len(cluster) == 1:
                self.cluster_medoids.append(cluster[0])
            else:
                total_distances = []
                for i in range(len(cluster)):
                    total_distances.append(0)
                    index_1 = self.matrix_names.index(cluster[i])
                    for j in range(len(cluster)):
                        if i == j:
                            pass
                        else:
                            index_2 = self.matrix_names.index(cluster[j])
                            total_distances[-1] += self.distance_matrix[index_1][index_2]
                self.cluster_medoids.append(cluster[total_distances.index(min(total_distances))])

    def performClustering(self):
        self.createDistanceMatrix()

        distance_array = numpy.array(self.distance_matrix)
        lnk = linkage(squareform(distance_array), method="average")

        full_dg = dendrogram(lnk)
        truncated_dg = dendrogram(lnk,p=50,truncate_mode="lastp")

        self.dendrogram = truncated_dg
        self.cluster_members = []

        full_id = 0
        for entry in truncated_dg['ivl']:
            self.cluster_members.append([])
            if len(entry.split("(")) > 1:
                member_num = int(entry.split("(")[1].split(")")[0])
                for i in range(member_num):
                    self.cluster_members[-1].append(self.matrix_names[int(full_dg['ivl'][full_id])])
                    full_id += 1
            else:
                self.cluster_members[-1].append(self.matrix_names[int(full_dg['ivl'][full_id])])
                full_id += 1

        self.findMedoids()

    def maxAbs(self, input_list):
        abs_list = []
        for entry in input_list:
            abs_list.append(abs(entry))
        max_index = None
        max_value = None
        for i in range(len(abs_list)):
            if max_index is None:
                max_index = i
                max_value = abs_list[i]
            elif abs_list[i] > max_value:
                max_index = i
                max_value = abs_list[i]
            elif abs_list[i] == max_value:
                if input_list[i] > input_list[max_index]:
                    max_index = i
        return input_list[max_index]

    def findClusterCorrelationValues(self):
        self.cluster_correlation_values = []

        for i in range(len(self.cluster_members)):
            self.cluster_correlation_values.append([])
            if self.sort_vector:
                for j in range(len(self.cluster_members[i])):
                    index = self.matrix_names.index(self.cluster_members[i][j])
                    for k in range(len(self.correlation_matrix[index])):
                        if j == 0:
                            self.cluster_correlation_values[-1].append([])
                        self.cluster_correlation_values[-1][k].append(self.correlation_matrix[index][k])
            else:
                for j in range(len(self.cluster_members)):
                    self.cluster_correlation_values[-1].append([])
                    for k in range(len(self.cluster_members[i])):
                        for l in range(len(self.cluster_members[j])):
                            index_1 = self.matrix_names.index(self.cluster_members[i][k])
                            index_2 = self.matrix_names.index(self.cluster_members[j][l])
                            self.cluster_correlation_values[-1][-1].append(self.correlation_matrix[index_1][index_2])

        self.max_correlation_values = []
        self.med_correlation_values = []
        self.max_abs_correlation_values = []

        for i in range(len(self.cluster_correlation_values)):
            self.max_correlation_values.append([])
            self.med_correlation_values.append([])
            self.max_abs_correlation_values.append([])
            for j in range(len(self.cluster_correlation_values)):
                self.max_correlation_values[-1].append(max(self.cluster_correlation_values[i][j]))
                self.med_correlation_values[-1].append(numpy.median(self.cluster_correlation_values[i][j]))
                self.max_abs_correlation_values[-1].append(self.maxAbs(self.cluster_correlation_values[i][j]))

    def getOutputDict(self):
        # Return an output dict of the analysis results
        return dict(
            bin_parameters={
                "window_start": self.window_start,
                "bin_number": self.bin_number,
                "bin_size": self.bin_size,
            },
            matrix_files=self.matrix_files,
            matrix_names=self.matrix_names,
            correlation_matrix=self.correlation_matrix,
            dendrogram=self.dendrogram,
            cluster_members=self.cluster_members,
            cluster_correlation_values=self.cluster_correlation_values,
            max_cluster_correlation_values=self.max_correlation_values,
            med_cluster_correlation_values=self.med_correlation_values,
            max_abs_correlation_values=self.max_abs_correlation_values,
            sort_orders=self.sort_orders,
            cluster_medoids=self.cluster_medoids,
            sort_vector=getattr(self, 'sort_vector', None),
        )

    def writeJson(self, fn):
        output_dict = self.writeOutputDict()
        with open(fn, 'w') as f:
            json.dump(output_dict, f, separators=(",", ": "))

    def readInSortVector(self, input_file):
        """
        Loads sort vector using numpy
        """
        return numpy.loadtxt(input_file, usecols=[1])

    def findVectorMatrixCorr(self, vector, fn, bin_number):
        """
        Find correlation of each bin with vector in matrix
        """

        lst = []

        input_matrix = numpy.loadtxt(
            fn, skiprows=1,
            usecols=tuple(range(1, bin_number+1)),
            unpack=True)

        for i in range(len(input_matrix)):
            lst.append(stats.spearmanr(vector, input_matrix[i])[0])

        return lst

    def execute(self):
        self.readMatrixFiles()
        self.createSortOrders()
        self.createCorrelationMatrix()
        self.performClustering()
        self.findClusterCorrelationValues()


@click.command()
@click.argument('matrix_list_fn', type=str)
@click.argument('window_start', type=int)
@click.argument('bin_number', type=int)
@click.argument('bin_size', type=int)
@click.argument('output_json', type=str)
@click.option('--sort_vector', nargs=1, type=str, help="Sort vector for correlative analysis")

def cli(matrix_list_fn, window_start, bin_number,
        bin_size, output_json, sort_vector):
    """
    Considering matrix files specified by a list, performs cross-matrix
    correlative analysis.

    \b
    Arguments:
    - matrix_list_fn:      List of matrix files to be considered in analysis. Each
                        row in the list corresponds to a matrix to be considered
                        in the analysis. The list contains two columns. The
                        first specifies the name to be given to a matrix. The
                        second specifies the path of the associated matrix file.
    - window_start:     The first position of the analysis window relative to
                        the features in the associated feature list.
    - bin_number:       Number of bins used
    - bin_size:         Size of each bin
    - output_json:      Filename of output JSON
    """

    assert os.path.exists(matrix_list_fn)
    with open(matrix_list_fn) as f:
        matrix_list = [
            line.strip().split()
            for line in f.readlines()
        ]

    mm = MatrixByMatrix(matrix_list, window_start, bin_number, bin_size, sort_vector)
    mm.writeJson(output_json)


if __name__ == '__main__':
    cli()
