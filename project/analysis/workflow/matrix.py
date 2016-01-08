#!/usr/bin/env python

import click
import os
from subprocess import call
from six import string_types

class BedMatrix(object):

    ANCHOR_OPTIONS = ('start', 'end', 'center')
    bigWigAverageOverBed_path = "/ddn/gs1/home/lavenderca/bigWigAverageOverBed"
    temp_bed_fn = "temp_feature_bin.bed"
    temp_int_plus_fn = "temp_intersection.plus.tab"
    temp_int_minus_fn = "temp_intersection.minus.tab"
    temp_int_unstranded_fn = "temp_intersection.tab"

    def __init__(self, bigwigs, feature_bed, output_matrix, anchor, bin_start,
        bin_number, bin_size, opposite_strand_fn, stranded_bigwigs,
        stranded_bed):
        
        # Set instance variables
        self.feature_bed = feature_bed
        self.output_matrix = output_matrix
        self.anchor = anchor
        self.bin_start = bin_start
        self.bin_number = bin_number
        self.bin_size = bin_size
        self.opposite_strand_fn = opposite_strand_fn
        self.stranded_bigwigs = stranded_bigwigs
        if self.stranded_bigwigs:
            if len(bigwigs) != 2:
                raise ValueError("Two paired bigwig files are expected!!")
            self.plus_bigwig = bigwigs[0]
            self.minus_bigwig = bigwigs[1]
        else:
            if len(bigwigs) != 1:
                raise ValueError("One unstranded bigwig file is expected!!")
            self.unstranded_bigwig = bigwigs[0]
        self.stranded_bed = stranded_bed
        
        # Type checks
        assert anchor in self.ANCHOR_OPTIONS
        assert isinstance(self.bin_start, int)
        assert isinstance(self.bin_number, int)
        assert isinstance(self.bin_size, int)
        if self.opposite_strand_fn is not None:
            assert isinstance(self.opposite_strand_fn, string_types)
            if os.path.dirname(self.output_matrix) != "":
                assert os.path.exists(os.path.dirname(self.opposite_strand_fn))
            if not self.stranded_bed:
                raise ValueError("Cannot report opposite strand coverage without stranded_bed flag!!")
        if self.stranded_bigwigs:
            assert os.path.exists(self.plus_bigwig)
            assert os.path.exists(self.minus_bigwig)
        else:
            assert os.path.exists(self.unstranded_bigwig)
        assert os.path.exists(self.feature_bed)
        if os.path.dirname(self.output_matrix) != "":
            assert os.path.exists(os.path.dirname(self.output_matrix))
        
        # Execute
        self.make_bed()
        self.bigwig_average_over_bed()
        self.make_matrix()

    def checkInt(self, num):
        # Return int if possible, else return float
        try:
            return int(num)
        except ValueError:
            return float(num)

    def countValidBedLines(self, input_file):
        # Count valid feature lines in bed file
        line_count = 0
        with open(input_file) as f:
            for line in f:
                if line == "\n":
                    pass
                elif line[0] == "#":
                    pass
                elif line.split()[0].lower() in ("track", "browser"):
                    pass
                else:
                    line_count += 1
        return line_count

    def generateFeatureName(self, feature_header, feature_count, num_lines):
        # Generate row/feature names for bed entries
        feature_name = feature_header + "_"
        for i in range(len(str(feature_count)), len(str(num_lines))):
            feature_name = feature_name + "0"
        feature_name = feature_name + str(feature_count)
        return feature_name

    def checkHeader(self, line):
        # Check to see if line is header
        if line == "\n":
            return True
        elif line[0] == "#":
            return True
        elif line.split()[0].lower() in ("track", "browser"):
            return True
        else:
            return False

    def readTabName(self, tab_name):
        # Read feature name from tab-identifier
        feature_name = tab_name.split("_")
        del feature_name[-1]
        feature_name = "_".join(feature_name)
        return feature_name

    def make_bed(self):
        """
        Open bed file, create a bed of bins.
        Create a dictionary with feature information.
        Create list with order of features in bed file.
        """
        input_file = self.feature_bed
        output_file = self.temp_bed_fn
        feature_dict = {}
        feature_list = []
        with open(input_file, 'r') as f, \
                open(output_file, "w") as OUTPUT:
            total_valid_lines = self.countValidBedLines(input_file)
            count = 0
            for line in f:
                if not self.checkHeader(line):

                    # Read fields from bed
                    bed_fields = len(line.strip().split())
                    chromosome, start, end = line.strip().split()[0:3]
                    start = int(start) + 1  # Convert from 0-based to 1-based
                    end = int(end)
                    center = int((start + end) / 2)
                    if bed_fields >= 4:  # Contains name information?
                        name = line.strip().split()[3]
                    else:
                        name = self.generateFeatureName("feature", count, total_valid_lines)
                    feature_list.append(name)
                    if self.stranded_bed:
                        if bed_fields >= 6:  # Contains strand information?
                            strand = line.strip().split()[5]
                        else:
                            raise ValueError("BED file lacks strand column!!")
                    else:
                        strand = "AMBIG"

                    # Update feature dict
                    feature_dict[name] = {
                        "chromosome": chromosome,
                        "start": start,
                        "end": end,
                        "strand": strand
                    }

                    # Define anchor point for window
                    if self.anchor == "center":
                        start = center
                    elif self.anchor == "start":
                        if strand == "-":
                            start = end
                    elif self.anchor == "end":
                        if strand == "+" or strand == "AMBIG":
                            start = end

                    # Create bed with bins for the given line
                    if strand == "+" or strand == "AMBIG":
                        start = start + self.bin_start
                        for i in range(self.bin_number):
                            str_ = '{}\t{}\t{}\t{}_{}\n'.format(
                                chromosome,
                                start - 1,
                                start + self.bin_size - 1,
                                name,
                                i
                            )
                            OUTPUT.write(str_)
                            start += self.bin_size
                    elif strand == "-":
                        start = start - self.bin_start
                        for i in range(self.bin_number):
                            str_ = '{}\t{}\t{}\t{}_{}\n'.format(
                                chromosome,
                                start - self.bin_size,
                                start,
                                name,
                                i
                            )
                            OUTPUT.write(str_)
                            start -= self.bin_size
        self.feature_order = feature_list
        self.feature_info = feature_dict

    def bigwig_average_over_bed(self):
        # Run bigWigAverageOverBed considering bed of bins
        if self.stranded_bigwigs:
            call([
                self.bigWigAverageOverBed_path,
                self.plus_bigwig,
                self.temp_bed_fn,
                self.temp_int_plus_fn
            ])
            call([
                self.bigWigAverageOverBed_path,
                self.minus_bigwig,
                self.temp_bed_fn,
                self.temp_int_minus_fn
            ])
        else:
            call([
                self.bigWigAverageOverBed_path,
                self.unstranded_bigwig,
                self.temp_bed_fn,
                self.temp_int_unstranded_fn
            ])

    def make_matrix(self):
        # Create output matrix files
        if self.stranded_bigwigs:
            self.make_stranded_matrix()
        else:
            self.make_unstranded_matrix()

    def make_unstranded_matrix(self):
        # Create output matrix for unstranded bigwig
        with open(self.temp_int_unstranded_fn, 'r') as f, \
                open(self.output_matrix, 'w') as OUTPUT:

            # Make header, write to output
            for i in range(self.bin_number):
                str_ = "\t{}:{}".format(
                    self.bin_start+i*self.bin_size,
                    self.bin_start+(i+1)*self.bin_size-1
                )
                OUTPUT.write(str_)
            OUTPUT.write("\n")

            # Make features, add to dictionary
            row_dict = dict()
            for line in f:
                tab_name, size, covered, bed_sum, bed_mean_zero, bed_mean = \
                    line.strip().split()
                bed_sum = self.checkInt(bed_sum)
                feature_name = self.readTabName(tab_name)
                if feature_name not in row_dict:
                    row_dict[feature_name] = ""
                row_dict[feature_name] += "\t" + str(bed_sum)

            # Write to output based on order in feature list
            for feature_name in self.feature_order:
                OUTPUT.write(feature_name + row_dict[feature_name] + "\n")

    def make_stranded_matrix(self):
        """
        Create output matrix for stranded bigwig
        """
        # If opposite_strand filename exists, open opposite strand for output
        OPPOSITE = None
        if self.opposite_strand_fn:
            OPPOSITE = open(self.opposite_strand_fn, "w")

        with open(self.temp_int_plus_fn) as plus_file, \
                open(self.temp_int_minus_fn) as minus_file, \
                open(self.output_matrix, "w") as OUTPUT:

            # Make header
            for i in range(self.bin_number):
                OUTPUT.write("\t{}:{}".format(
                    self.bin_start+i*self.bin_size,
                    self.bin_start+(i+1)*self.bin_size-1
                ))
                if OPPOSITE:
                    OPPOSITE.write("\t{}:{}".format(
                        self.bin_start+i*self.bin_size,
                        self.bin_start+(i+1)*self.bin_size-1
                    ))

            OUTPUT.write("\n")
            if OPPOSITE:
                OPPOSITE.write("\n")

            #last_feature = None

            same_dict = dict()
            opposite_dict = dict()
            for plus_line, minus_line in zip(plus_file, minus_file):

                plus_tab_name, size, plus_covered, \
                    plus_sum, plus_mean_zero, plus_mean = \
                    plus_line.strip().split()

                minus_tab_name, size, minus_covered, \
                    minus_sum, minus_mean_zero, minus_mean = \
                    minus_line.strip().split()

                plus_feature_name = self.readTabName(plus_tab_name)
                minus_feature_name = self.readTabName(minus_tab_name)
                plus_sum = str(self.checkInt(plus_sum))
                plus_mean_zero = str(self.checkInt(plus_mean_zero))
                plus_mean = str(self.checkInt(plus_mean))

                # Minus values are commonly reported as negative values
                # Change to absolute value
                minus_sum = str(abs(self.checkInt(minus_sum)))
                minus_mean_zero = str(abs(self.checkInt(minus_mean_zero)))
                minus_mean = str(abs(self.checkInt(minus_mean)))

                # Double check tab names
                if plus_feature_name != minus_feature_name:
                    raise ValueError("Stranded feature names in intersection files do not agree by line")


                if plus_feature_name not in same_dict:
                    same_dict[plus_feature_name] = ""
                if OPPOSITE:
                    if plus_feature_name not in opposite_dict:
                        opposite_dict[plus_feature_name] = ""

                # Write values, observing strandedness if specified
                if self.stranded_bed:
                    if self.feature_info[plus_feature_name]["strand"] == "+":
                        #same_value = plus_sum
                        #opposite_value = minus_sum
                        same_dict[plus_feature_name] += "\t" + plus_sum
                        if OPPOSITE:
                            opposite_dict[plus_feature_name] += "\t" + minus_sum
                    elif self.feature_info[plus_feature_name]["strand"] == "-":
                        #same_value = minus_sum
                        #opposite_value = plus_sum
                        same_dict[plus_feature_name] += "\t" + minus_sum
                        if OPPOSITE:
                            opposite_dict[plus_feature_name] += "\t" + plus_sum


                else:
                    same_dict[plus_feature_name] += "\t{}".format(
                        self.checkInt(float(plus_sum)+float(minus_sum)))


            
            for feature_name in self.feature_order:
                OUTPUT.write(feature_name + same_dict[feature_name] + "\n")
                if OPPOSITE:
                    OPPOSITE.write(feature_name + opposite_dict[feature_name] + "\n")


@click.command()
@click.argument('bigwigs', nargs=-1)
@click.argument('feature_bed')
@click.argument('output_matrix')
@click.option('-a', '--anchor', default='center', help='Bin anchor', type=click.Choice(BedMatrix.ANCHOR_OPTIONS))
@click.option('-b', '--bin_start', default=-2500, help='Relative bin start', type=int)
@click.option('-n', '--bin_number', default=50, help='Number of bins', type=int)
@click.option('-s', '--bin_size', default=100, help='Size of bins', type=int)
@click.option('--opposite_strand_fn', type=str, help='Output filename for opposite strand coverage')
@click.option('--stranded_bigwigs', is_flag=True, help='Expect stranded, paired bigwigs with plus/forward strand first')
@click.option('--stranded_bed', is_flag=True, help='Expect stranded bed')

def cli(bigwigs, feature_bed, output_matrix, anchor, bin_start, bin_number,
    bin_size, opposite_strand_fn, stranded_bigwigs, stranded_bed):
    """
    Generate matrices for stranded or unstranded bigWig matrices
    """
    BedMatrix(bigwigs, feature_bed, output_matrix, anchor, bin_start,
        bin_number, bin_size, opposite_strand_fn, stranded_bigwigs,
        stranded_bed)

if __name__ == '__main__':
    cli()