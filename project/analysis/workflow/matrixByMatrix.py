#!/usr/bin/env python

import click
import numpy
from scipy import stats
from scipy.cluster.hierarchy import linkage, dendrogram
from scipy.spatial.distance import squareform
import os
import json


class MatrixByMatrix():

    def __init__(self,
                 matrix_list, window_start, bin_number, 
                 bin_size, output_header, sort_vector):
        
        #self.input_vector = input_vector
        self.matrix_list = matrix_list
        self.window_start = window_start
        self.bin_number = bin_number
        self.bin_size = bin_size
        self.output_header = output_header
        self.sort_vector = sort_vector
        
        #assert os.path.exists(self.input_vector)
        assert os.path.exists(self.matrix_list)
        assert isinstance(window_start, int)
        assert isinstance(bin_number, int)
        assert isinstance(bin_size, int)
        
        if sort_vector:
            assert os.path.exists(self.sort_vector)
        
        self.execute()

    def readInVector(self, input_file):
        """
        Matrix format:
        - label for matrix \t matrix file name, w/ path \n
       
        Reads in second column as input vector.
        Note: assumes same row sort order for vector, each matrix.
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

    def findMatrixMatrixCorr(self, matrix_1_fn, matrix_2_fn, bin_number):
        """
        Find correlation value for two matrices
        Create two vectors, one for each matrix
        Vectors are sums across columns for each row
        Find correlation for vectors
        """
        
        matrix_1 = numpy.loadtxt(
            matrix_1_fn, skiprows=1,usecols=tuple(range(1, bin_number+1)),
            unpack=True
        )
        matrix_2 = numpy.loadtxt(
            matrix_2_fn, skiprows=1,usecols=tuple(range(1, bin_number+1)),
            unpack=True
        )
        
        vector_1 = numpy.sum(matrix_1, axis=0)
        vector_2 = numpy.sum(matrix_2, axis=0)
        
        return stats.spearmanr(vector_1, vector_2)[0]

    def execute(self):
        """
        Convert list of lists into numpy array
        Perform clustering
        Sort matrix by clustering results, output file
        Export dendrogram
        """
       
        output_matrix = []
        row_names = []
        
        matrix_list = [
                line.strip().split()
                for line in open(self.matrix_list, 'r')
            ]
        
        if self.sort_vector:
            vector = self.readInVector(self.sort_vector)
            for matrix_entry in matrix_list:
                output_matrix.append(
                    self.findVectorMatrixCorr(
                        vector, matrix_entry[1], self.bin_number
                    )
                )
        else:
            for i in range(len(matrix_list)):
                output_matrix.append([])
                for j in range(len(matrix_list)):
                    if i == j:
                        output_matrix[-1].append(0)
                    else:
                        output_matrix[-1].append(
                            # Subtracting from one to create distance metric
                            1 - self.findMatrixMatrixCorr(matrix_list[i][1],
                            matrix_list[j][1], self.bin_number)
                        )
        
        for matrix_entry in matrix_list:
            row_names.append(matrix_entry[0])
        
        output_array = numpy.array(output_matrix)
        if self.sort_vector:
            lnk = linkage(output_array)
        else:
            lnk = linkage(squareform(output_array))
        dg = dendrogram(lnk)

        # build output rows
        rows = []

        if self.sort_vector:
            row = ['', ]
            for i in range(self.bin_number):
                row.append('{}:{}'.format(
                    self.window_start + i * self.bin_size,
                    self.window_start + (i + 1) * self.bin_size - 1
                ))
            row.append('\n')
        else:
            row = ['', ]
            for i in dg['leaves']:
                row.append(row_names[i])
            row.append('\n')
        rows.append('\t'.join(row))

        for i in dg['leaves']:
            row = [row_names[i], ]
            if self.sort_vector:
                for j in range(len(output_matrix[i])):
                    row.append(str(output_matrix[i][j]))
            else:
                for j in dg['leaves']:
                    row.append(str(1 + output_matrix[i][j])) # Converts from distance to correlation value
            row.append('\n')
            rows.append('\t'.join(row))

        with open('{}.matrix.txt'.format(self.output_header), 'w') as f:
            f.writelines(rows)

        with open('{}.dendrogram.json'.format(self.output_header), 'w') as f:
            json.dump(dg, f)


@click.command()
@click.argument('matrix_list', type=str)
@click.argument('window_start', type=int)
@click.argument('bin_number', type=int)
@click.argument('bin_size', type=int)
@click.argument('output_header', type=str)
@click.option('--sort_vector', nargs=1, type=str, help="Sort vector for correlative analysis")

def cli(matrix_list, window_start, bin_number, 
        bin_size, output_header, sort_vector):
    """
    Considering matrix files specified by a list, performs cross-matrix
    correlative analysis.
    
    \b
    Arguments:
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
    
    MatrixByMatrix(matrix_list, window_start, bin_number, bin_size,
        output_header, sort_vector)


if __name__ == '__main__':
    cli()
