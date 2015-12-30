#!/usr/bin/env python

import numpy
from scipy import stats
from scipy.cluster.hierarchy import linkage, dendrogram
import sys
import csv
import json

if len(sys.argv) == 1:
    sys.stdout.write("Usage: " + sys.argv[0] + " <Input vector> <Matrix list> <Window start> <Bin number> <Bin size> <Output header>\n")
    exit()

## MATRIX LIST FORMAT:
## LABEL FOR MATRIX \t MATRIX FILE NAME, W/ PATH \n

## READS IN SECOND COLUMN AS INPUT VECTOR
## NOTE: ASSUMES SAME ROW SORT ORDER FOR VECTOR, EACH MATRIX
def readInVector(input_file):
    return(numpy.loadtxt(input_file, usecols=[1]))

## FOR A MATRIX, FIND CORRELATION OF EACH BIN WITH VECTOR
## RETURN LIST
def findCorrForMatrix(vector, matrix_file, bin_num):
    corr_values = []
    input_matrix = numpy.loadtxt(matrix_file, skiprows=1, usecols=tuple(range(1,bin_num+1,1)), unpack = True)
    for i in range(len(input_matrix)):
        corr_values.append(stats.spearmanr(vector, input_matrix[i])[0])
    return corr_values

window_start = int(sys.argv[3])
bin_num = int(sys.argv[4])
bin_size = int(sys.argv[5])

output_matrix = []
row_names = []

vector = readInVector(sys.argv[1])
matrix_list = [line.strip().split() for line in open(sys.argv[2], "r")]
for matrix_entry in matrix_list:
    output_matrix.append(findCorrForMatrix(vector, matrix_entry[1], bin_num))
    row_names.append(matrix_entry[0])

## CONVERT LIST OF LISTS INTO NUMPY ARRAY
## PERFORM CLUSTERING
## SORT MATRIX BY CLUSTERING RESULTS, CREATE OUTPUT TXT FILE
## CREATE JSON DENDROGRAM
output_array = numpy.array(output_matrix)
lnk = linkage(output_array)
dg = dendrogram(lnk)

OUTPUT_MATRIX = open(sys.argv[6] + ".matrix.txt", "w")
OUTPUT_MATRIX.write("")
for i in range(bin_num):
    OUTPUT_MATRIX.write("\t" + str(window_start + i*bin_size) + ":" + str(window_start + (i + 1)*bin_size - 1))
OUTPUT_MATRIX.write("\n")

for i in dg["leaves"]:
    OUTPUT_MATRIX.write(row_names[i])
    for j in range(len(output_matrix[i])):
        OUTPUT_MATRIX.write("\t" + str(output_matrix[i][j]))
    OUTPUT_MATRIX.write("\n")
OUTPUT_MATRIX.close()

with open(sys.argv[6] + ".dendrogram.json", "w") as OUTPUT_DENDROGRAM:
    json.dump(dg, OUTPUT_DENDROGRAM)