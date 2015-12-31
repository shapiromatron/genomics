#!/usr/bin/env python

import click
import numpy
from scipy import stats
from scipy.cluster.hierarchy import linkage, dendrogram
import os
import json


class MatrixByMatrix():

    def __init__(self,
                 input_vector, matrix_list, window_start,
                 bin_number, bin_size, output_header):

        assert os.path.exists(self.input_vector)
        assert os.path.exists(self.matrix_list)
        assert isinstance(window_start, int)
        assert isinstance(bin_number, int)
        assert isinstance(bin_size, int)

        self.input_vector = input_vector
        self.matrix_list = matrix_list
        self.window_start = window_start
        self.bin_number = bin_number
        self.bin_size = bin_size
        self.output_header = output_header

        self.execute()

    def readInVector(self, input_file):
        """
        Matrix format:
        - label for matrix \t matrix file name, w/ path \n

        Reads in second column as input vector.
        Note: assumes same row sort order for vector, each matrix.
        """
        return numpy.loadtxt(input_file, usecols=[1])

    def findCorrForMatrix(self, vector, fn, bin_num):
        """
        Find correlation of each bin with vector in matrix
        """
        lst = []

        input_matrix = numpy.loadtxt(
            fn, skiprows=1,
            usecols=tuple(range(1, bin_num+1)),
            unpack=True)

        for i in range(len(input_matrix)):
            lst.append(stats.spearmanr(vector, input_matrix[i])[0])

        return lst

    def execute(self):
        """
        Convert list of lists into numpy array
        Perform clustering
        Sort matrix by clustering results, output file
        Export dendrogram
        """

        output_matrix = []
        row_names = []

        vector = self.readInVector(self.input_vector)
        matrix_list = [
            line.strip().split()
            for line in open(self.matrix_list, 'r')
        ]

        for matrix_entry in matrix_list:
            output_matrix.append(
                self.findCorrForMatrix(vector, matrix_entry[1], self.bin_num)
            )
            row_names.append(matrix_entry[0])

        output_array = numpy.array(output_matrix)
        lnk = linkage(output_array)
        dg = dendrogram(lnk)

        # build output rows
        rows = []

        row = ['', ]
        for i in range(self.bin_num):
            row.append('{}:{}'.format(
                self.window_start + i * self.bin_size,
                self.window_start + (i + 1) * self.bin_size - 1
            ))
        rows.append('\t'.join(row))

        for i in dg['leaves']:
            row = [row_names[i], ]
            for j in range(len(output_matrix[i])):
                row.append(str(output_matrix[i][j]))
            rows.append('\t'.join(row))

        with open('{}.matrix.txt'.format(self.output_header), 'w') as f:
            f.writelines(rows)

        with open('{}.dendrogram.json'.format(self.output_header), 'w') as f:
            json.dump(dg, f)


@click.command()
@click.argument('input_vector', type=str)
@click.argument('matrix_list', type=str)
@click.argument('window_start', type=int)
@click.argument('bin_number', type=int)
@click.argument('bin_size', type=int)
@click.argument('output_header', type=str)
def cli(input_vector, matrix_list, window_start,
        bin_number, bin_size, output_header):
    """
    Considering matrix files specified by a list, performs cross-matrix
    correlative analysis.

    \b
    Arguments:
    - input_vector:     A tab-delimited file with two columns, feature names
                        and numeric values to be used in correlative analysis.
    - matrix_list:      List of matrix files to be considered in analysis. Each
                        row in the list corresponds to a matrix to be considered
                        in the analysis. The list contains two columns. The
                        first specifies the name to be given to a matrix. The
                        second specifies the path of the associated matrix file.
    - window_start:     The first position of the analysis window relative to
                        the features in the associated feature list.
    - bin_number:       Number of bins used
    - bin_size:         Size of each bin
    - output_header:    Header of filenames generated
    """
    MatrixByMatrix(input_vector, matrix_list, window_start,
                   bin_number, bin_size, output_header)


if __name__ == '__main__':
    cli()
