#!/usr/bin/env python

import sys
import argparse
from subprocess import call
#from optparse import OptionParser

bigWigAverageOverBed_path = "/ddn/gs1/home/lavenderca/bigWigAverageOverBed"

if len(sys.argv) == 1:
    sys.stdout.write("Usage: python generate_matrix.py [Options] <bigWig> <Feature list bed> <Output file>\n"
                     "Usage: python generate_matrix.py [Options] --stranded_bigwigs <Forward bigWig> <Reverse bigWig> <Feature list bed> <Output file>\n"
                     "Options\t--anchor/-a <center/start/end>:\tBin achor (default: center)\n"
                     "\t--bin_start/-b <int>:\t\tRelative bin start (default: -2500)\n"
                     "\t--bin_number/-n <int>:\t\tNumber of bins (default: 50)\n"
                     "\t--bin_size/-s <int>:\t\tSize of bins (default: 100)\n"
                     "\t--stranded_bigwigs:\t\tExpect stranded bigwigs (default: False)\n"
                     "\t--stranded_bed:\t\t\tExpect stranded bed (default: False)\n"
                     "\t--opposite_strand <file name>:\tReport opposite strand coverage to file\n"
                     )
    exit()

parser = argparse.ArgumentParser(prog="generate_matrix.py")
parser.add_argument("-a", "--anchor", action="store", type=str, dest="anchor", default="center", help="--anchor/-a <center/start/end>:\tBin achor (default: center)")
parser.add_argument("-b", "--bin_start", action="store", type=int, dest="bin_start", default=-2500, help="bin_start/-b <int>:\t\tRelative bin start (default: -2500)")
parser.add_argument("-n", "--bin_number", action="store", type=int, dest="bin_number", default=50, help="--bin_number/-n <int>:\t\tNumber of bins (default: 50)")
parser.add_argument("-s", "--bin_size", action="store", type=int, dest="bin_size", default=100, help="--bin_size/-s <int>:\t\tSize of bins (default: 100)")
parser.add_argument("--stranded_bigwigs", action="store_true", dest="stranded_bigwigs", default=False, help="--stranded_bigwigs:\t\tExpect stranded, paired bigwigs (default: False)")
parser.add_argument("--stranded_bed", action="store_true", dest="stranded_bed", default=False, help="--stranded_bigwigs:\t\tExpect stranded bed (default: False)")
parser.add_argument("--opposite_strand", action="store", type=str, dest="opposite_strand", default=None, help="--opposite_strand <file name>:\tReport opposite strand coverage to file")
parser.add_argument("args", nargs=argparse.REMAINDER)

options = parser.parse_args()
args = options.args

anchor = options.anchor
bin_start = options.bin_start
bin_number = options.bin_number
bin_size = options.bin_size
stranded_bigwigs = options.stranded_bigwigs
stranded_bed = options.stranded_bed
opposite_strand = options.opposite_strand

if opposite_strand and not stranded_bed:
    sys.stderr.write("Cannot report opposite strand coverage without stranded_bed flag!!")
    exit()

if stranded_bigwigs:
    plus_bigwig, minus_bigwig, feature_bed, output_matrix = args
else:
    bigwig, feature_bed, output_matrix = args

## IF ABLE TO CONVERTED TO INT, RETURN INT; ELSE RETURN FLOAT
def checkInt(num):
    try:
        int(num)
    except ValueError:
        return(float(num))
    else:
        return(int(num))

## COUNT VALID FEATURE LINES IN BED FILE
def countValidBedLines(input_file):
    line_count = 0
    with open(input_file) as f:
        for line in f:
            if line == "\n":
                pass
            elif line[0] == "#":
                pass
            elif line.split()[0].lower() == "track" or line.split()[0].lower() == "browser":
                pass
            else:
                line_count += 1
    return line_count

## GENERATE ROW/FEATURE NAMES FOR BED ENTRIES
def generateFeatureName(feature_header, feature_count, num_lines):
    feature_name = feature_header + "_"
    for i in range(len(str(feature_count)), len(str(num_lines))):
        feature_name = feature_name + "0"
    feature_name = feature_name + str(feature_count)
    return feature_name

## CHECK TO SEE IF BED LINE IS HEADER
def checkHeader(line):
    if line == "\n":
        return True
    elif line[0] == "#":
        return True
    elif line.split()[0].lower() == "track" or line.split()[0].lower() == "browser":
        return True
    else:
        return False

## READ FEATURE NAME FROM TAB IDENTIFIER:
def readTabName(tab_name):
    feature_name = tab_name.split("_")
    del feature_name[-1]
    feature_name = "_".join(feature_name)
    return feature_name

## OPEN INPUT BED FILE, CREATE BED OF BINS
## ALSO RETURN DICTIONARY WITH FEATURE INFORMATION
def makeBed(input_file, output_file):
    feature_dict = dict()
    with open(input_file) as f, open(output_file, "w") as OUTPUT:
        total_valid_lines = countValidBedLines(input_file)
        count = 0
        for line in f:
            if not checkHeader(line):
                ## READ FIELDS FROM BED
                bed_fields = len(line.strip().split())
                chromosome, start, end = line.strip().split()[0:3]
                start = int(start)+1 ## CONVERT FROM O-BASED TO 1-BASED
                end = int(end)
                center = int((start+end)/2)
                if bed_fields >= 4: ## CONTAINS NAME INFORMATION?
                    name = line.strip().split()[3]
                else:
                    name = generateFeatureName("feature", count, total_valid_lines)
                if stranded_bed:
                    if bed_fields >= 6: ## CONTAINS STRAND INFORMATION?
                        strand = line.strip().split()[5]
                    else:
                        sys.stderr.write("BED file lacks strand column!!\n")
                        exit()
                else:
                    strand = "AMBIG"
                ## UPDATE FEATURE DICT
                feature_dict[name] = {"chromosome":chromosome, "start":start, "end":end, "strand":strand}
                ## DEFINE ANCHOR POINT FOR WINDOW
                if anchor == "center":
                    start = center
                elif anchor == "start":
                    if strand == "-":
                        start = end
                elif anchor == "end":
                    if strand == "+" or strand == "AMBIG":
                        start = end
                ## CREATE BED WITH BINS FOR THE GIVEN LINE
                if strand == "+" or strand == "AMBIG":
                    start = start + bin_start
                    for i in range(bin_number):
                        OUTPUT.write(chromosome + "\t" + str(start-1) + "\t" + str(start + bin_size - 1) + "\t" + name + "_" + str(i) + "\n")
                        start += bin_size
                elif strand == "-":
                    start = start - bin_start
                    for i in range(bin_number):
                        OUTPUT.write(chromosome + "\t" + str(start - bin_size) + "\t" + str(start) + "\t" + name + "_" + str(i) + "\n")
                        start -= bin_size
    return feature_dict

## CREATE OUTPUT MATRIX, UNSTRANDED BIGWIG
def makeMatrixWithUnstrandedBigWig(intersection_file, output_file):
    with open(intersection_file) as f, open(output_file, "w") as OUTPUT:
        ## MAKE HEADER
        for i in range(bin_number):
            OUTPUT.write("\t" + str(bin_start+i*bin_size) + ":" + str(bin_start+(i+1)*bin_size-1))
        last_feature = None
        for line in f:
            tab_name, size, covered, bed_sum, bed_mean_zero, bed_mean = line.strip().split()
            bed_sum = checkInt(bed_sum)
            feature_name = readTabName(tab_name)
            if feature_name == last_feature:
                OUTPUT.write("\t" + str(bed_sum))
            else:
                OUTPUT.write("\n")
                OUTPUT.write(feature_name + "\t" + str(bed_sum))
                last_feature = feature_name
        OUTPUT.write("\n")

##CREATE OUTPUT MATRIX, STRANDED BIGWIGS
def makeMatrixWithStrandedBigWigs(plus_intersection, minus_intersection, output_file):
    ## IF OPPOSITE_STRAND IS NOT 'NONE', OPEN OPPOSITE STRAND FOR OUTPUT 
    if opposite_strand:
        OPPOSITE = open(opposite_strand, "w")
    with open(plus_intersection) as plus_file, open(minus_intersection) as minus_file, open(output_file, "w") as OUTPUT:
        ## MAKE HEADER
        for i in range(bin_number):
            OUTPUT.write("\t" + str(bin_start+i*bin_size) + ":" + str(bin_start+(i+1)*bin_size-1))
            if opposite_strand:
                OPPOSITE.write("\t" + str(bin_start+i*bin_size) + ":" + str(bin_start+(i+1)*bin_size-1))
        OUTPUT.write("\n")
        if opposite_strand:
            OPPOSITE.write("\n")
        last_feature = None
        for plus_line, minus_line in zip(plus_file, minus_file):
            plus_tab_name, size, plus_covered, plus_sum, plus_mean_zero, plus_mean = plus_line.strip().split()
            minus_tab_name, size, minus_covered, minus_sum, minus_mean_zero, minus_mean = minus_line.strip().split()
            plus_feature_name = readTabName(plus_tab_name)
            minus_feature_name = readTabName(minus_tab_name)
            plus_sum = str(checkInt(plus_sum))
            plus_mean_zero = str(checkInt(plus_mean_zero))
            plus_mean = str(checkInt(plus_mean))
            ## MINUS VALUES ARE COMMONLY REPORTED AS NEGATIVE VALUES
            ## CHANGE TO ABSOLUTE VALUE
            minus_sum = str(abs(checkInt(minus_sum)))
            minus_mean_zero = str(abs(checkInt(minus_mean_zero)))
            minus_mean = str(abs(checkInt(minus_mean)))
            ## DOUBLE CHECK TAB NAMES
            if plus_feature_name != minus_feature_name:
                sys.stderr.write("Stranded feature names in intersection files do not agree by line!!")
                exit()
            ## START NEW LINE IF NEW FEATURE NAME
            if plus_feature_name != last_feature:
                if last_feature:
                    OUTPUT.write("\n")
                    if opposite_strand:
                        OPPOSITE.write("\n")
                OUTPUT.write(plus_feature_name)
                if opposite_strand:
                    OPPOSITE.write(plus_feature_name)
                last_feature = plus_feature_name
            ## WRITE VALUES, OBSERVING STRANDEDNESS IF SPECIFIED
            if stranded_bed:
                if feature_info[plus_feature_name]["strand"] == "+":
                    same_value = plus_sum
                    opposite_value = minus_sum
                elif feature_info[plus_feature_name]["strand"] == "-":
                    same_value = minus_sum
                    opposite_value = plus_sum
                OUTPUT.write("\t" + same_value)
                if opposite_strand:
                    OPPOSITE.write("\t" + opposite_value)
            else:
                OUTPUT.write("\t" + str(checkInt(float(plus_sum)+float(minus_sum))))
        OUTPUT.write("\n")
        if opposite_strand:
            OPPOSITE.write("\n")

## CREATE BED FILE
feature_info = makeBed(feature_bed, "temp_feature_bin.bed")

## RUN BIGWIGAVERAGEOVERBED CONSIDERING BED OF BINS
if stranded_bigwigs:
    call([bigWigAverageOverBed_path, plus_bigwig, "temp_feature_bin.bed", "temp_intersection.plus.tab"])
    call([bigWigAverageOverBed_path, minus_bigwig, "temp_feature_bin.bed", "temp_intersection.minus.tab"])
else:
    call([bigWigAverageOverBed_path, bigwig, "temp_feature_bin.bed", "temp_intersection.tab"])

## CREATE OUTPUT MATRIX FILES
if stranded_bigwigs:
    makeMatrixWithStrandedBigWigs("temp_intersection.plus.tab", "temp_intersection.minus.tab", output_matrix)
else:
    makeMatrixWithUnstrandedBigWig("temp_intersection.tab", output_matrix)