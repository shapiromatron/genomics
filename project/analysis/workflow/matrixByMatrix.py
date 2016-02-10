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
                 bin_size, output_json, sort_vector):
        
        #self.input_vector = input_vector
        self.matrix_list = matrix_list
        self.window_start = window_start
        self.bin_number = bin_number
        self.bin_size = bin_size
        self.output_json = output_json
        self.sort_vector = sort_vector
        
        #assert os.path.exists(self.input_vector)
        assert os.path.exists(self.matrix_list)
        assert isinstance(window_start, int)
        assert isinstance(bin_number, int)
        assert isinstance(bin_size, int)
        
        if sort_vector:
            assert os.path.exists(self.sort_vector)
        
        self.execute()

    def readMatrixFiles(self):
        self.matrix_files = []
        self.matrix_names = []
        
        with open(self.matrix_list) as f:
            for line in f:
                matrix_name, file_name = line.strip().split()
                
                self.matrix_files.append(file_name)
                self.matrix_names.append(matrix_name)

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
        self.vector_list = []
        
        for fn in self.matrix_files:
            
            matrix = numpy.loadtxt(
                fn, skiprows=1, usecols=tuple(range(1, self.bin_number+1)),
                unpack=True
            )
            
            vector = numpy.sum(matrix, axis=0)
            self.vector_list.append(vector)

    def createCorrelationMatrix(self):
        self.correlation_matrix = []
        
        for i in range(len(self.vector_list)):
            self.correlation_matrix.append([])
            for j in range(len(self.vector_list)):
                if i == j:
                    self.correlation_matrix[-1].append(1)
                else:
                    try:
                        self.correlation_matrix[j][i]
                    except IndexError:
                        self.correlation_matrix[-1].append(stats.spearmanr(self.vector_list[i], self.vector_list[j])[0])
                    else:
                        self.correlation_matrix[-1].append(self.correlation_matrix[j][i])
    
    def createDistanceMatrix(self):
        self.distance_matrix = []
        
        for i in range(len(self.correlation_matrix)):
            self.distance_matrix.append([])
            for j in range(len(self.correlation_matrix[i])):
                self.distance_matrix[-1].append(1 - self.correlation_matrix[i][j])

    def performClustering(self):
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

    def writeJson(self):
        output_dict = dict()
        
        output_dict["bin_parameters"] = {"window_start":self.window_start, "bin_number":self.bin_number, "bin_size":self.bin_size}
        output_dict["matrix_files"] = self.matrix_files
        output_dict["matrix_names"] = self.matrix_names
        output_dict["correlation_matrix"] = self.correlation_matrix
        #output_dict["distance_matrix"] =  self.distance_matrix
        output_dict["dendrogram"] =  self.dendrogram
        output_dict["cluster_members"] = self.cluster_members
        output_dict["cluster_correlation_values"] = self.cluster_correlation_values
        output_dict["max_cluster_correlation_values"] = self.max_correlation_values
        output_dict["med_cluster_correlation_values"] = self.med_correlation_values
        output_dict["max_abs_correlation_values"] = self.max_abs_correlation_values
        output_dict["sort_orders"] = self.sort_orders
        if self.sort_vector:
            output_dict["sort_vector"] = self.sort_vector
        
        with open(self.output_json, 'w') as f:
            json.dump(output_dict, f, indent=2, separators=(",",": "))

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

    def createSVCorrelationMatrix(self):
        sort_vector = self.readInSortVector(self.sort_vector)
        self.correlation_matrix = []
        
        for matrix in self.matrix_files:
            self.correlation_matrix.append(
                self.findVectorMatrixCorr(
                    sort_vector, matrix, self.bin_number
                )
            )

    def performSVClustering(self):
        lnk = linkage(numpy.array(self.correlation_matrix), method="average")
        
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

    def findSVClusterCorrelationValues(self):
        self.cluster_correlation_values = []
        
        for i in range(len(self.cluster_members)):
            self.cluster_correlation_values.append([])
            for j in range(len(self.cluster_members[i])):
                index = self.matrix_names.index(self.cluster_members[i][j])
                for k in range(len(self.correlation_matrix[index])):
                    if j == 0:    
                        self.cluster_correlation_values[-1].append([])
                    self.cluster_correlation_values[-1][k].append(self.correlation_matrix[index][k])
        
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
    
    def execute(self):
        self.readMatrixFiles()
        self.createSortOrders()
        if self.sort_vector:
            self.createSVCorrelationMatrix()
            self.performSVClustering()
            self.findSVClusterCorrelationValues()
        else:
            self.createVectorList()
            self.createCorrelationMatrix()
            self.createDistanceMatrix()
            self.performClustering()
            self.findClusterCorrelationValues()
        self.writeJson()

@click.command()
@click.argument('matrix_list', type=str)
@click.argument('window_start', type=int)
@click.argument('bin_number', type=int)
@click.argument('bin_size', type=int)
@click.argument('output_json', type=str)
@click.option('--sort_vector', nargs=1, type=str, help="Sort vector for correlative analysis")

def cli(matrix_list, window_start, bin_number, 
        bin_size, output_json, sort_vector):
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
    - output_json:      Filename of output JSON
    """
    
    MatrixByMatrix(matrix_list, window_start, bin_number, bin_size,
        output_json, sort_vector)


if __name__ == '__main__':
    cli()
