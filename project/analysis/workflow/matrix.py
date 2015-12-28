#!/usr/bin/env python

import click
import os
from subprocess import call


class BedMatrix(object):

    ANCHOR_OPTIONS = ('start', 'end', 'center')
    bigWigAverageOverBed_path = "/ddn/gs1/home/lavenderca/bigWigAverageOverBed"
    temp_bed_fn = "temp_feature_bin.bed"
    temp_int_plus_fn = "temp_intersection.plus.tab"
    temp_int_minus_fn = "temp_intersection.minus.tab"
    temp_int_unstranded_fn = "temp_intersection.tab"

    def __init__(self, *args,
                 anchor='center', bin_start=-2500, bin_number=50,
                 bin_size=100, opposite_strand_fn=None):

        if len(args) == 3:
            self.stranded_bigwigs = False
            self.stranded_bed = False
        elif len(args) == 4:
            self.stranded_bigwigs = True
            self.stranded_bed = True
        else:
            raise ValueError("Unknown argument number")

        # Type checks
        assert anchor in self.ANCHOR_OPTIONS
        assert isinstance(bin_start, int)
        assert isinstance(bin_number, int)
        assert isinstance(bin_size, int)
        if opposite_strand_fn is not None:
            assert isinstance(opposite_strand_fn, str)
            assert os.path.exists(os.path.dirname(opposite_strand_fn))
            if not self.stranded_bed:
                raise ValueError("Cannot report opposite strand coverage without stranded_bed flag!!")

        plus_bigwig = None
        minus_bigwig = None
        unstranded_bigwig = None
        feature_bed = None
        output_matrix = None

        if self.stranded_bigwigs:
            plus_bigwig, minus_bigwig, feature_bed, output_matrix = args
            assert os.path.exists(plus_bigwig)
            assert os.path.exists(minus_bigwig)
        else:
            unstranded_bigwig, feature_bed, output_matrix = args
            assert os.path.exists(unstranded_bigwig)

        assert os.path.exists(feature_bed)
        assert os.path.exists(os.path.dirname(output_matrix))

        # Set instance variables
        self.anchor = anchor
        self.bin_start = bin_start
        self.bin_number = bin_number
        self.bin_size = bin_size
        self.opposite_strand_fn = opposite_strand_fn
        self.plus_bigwig = plus_bigwig
        self.minus_bigwig = minus_bigwig
        self.unstranded_bigwig = unstranded_bigwig
        self.feature_bed = feature_bed
        self.output_matrix = output_matrix

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
        Return a dictionary with feature information.
        """
        input_file = self.feature_bed
        output_file = self.temp_bed_fn
        feature_dict = {}
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
            self.make_unstranded_matrix()
        else:
            self.make_stranded_matrix()

    def make_unstranded_matrix(self):
        # Create output matrix for unstranded bigwig
        with open(self.temp_int_unstranded_fn, 'r') as f, \
                open(self.output_matrix, 'w') as OUTPUT:

            # Make header
            for i in range(self.bin_number):
                str_ = "\t{}:{}".format(
                    self.bin_start+i*self.bin_size,
                    self.bin_start+(i+1)*self.bin_size-1
                )
                OUTPUT.write(str_)

            # Make features
            last_feature = None
            for line in f:
                tab_name, size, covered, bed_sum, bed_mean_zero, bed_mean = \
                    line.strip().split()
                bed_sum = self.checkInt(bed_sum)
                feature_name = self.readTabName(tab_name)
                if feature_name == last_feature:
                    OUTPUT.write("\t" + str(bed_sum))
                else:
                    OUTPUT.write("\n")
                    OUTPUT.write(feature_name + "\t" + str(bed_sum))
                    last_feature = feature_name

            OUTPUT.write("\n")

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

            last_feature = None

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

                # Start new line if new feature name
                if plus_feature_name != last_feature:

                    if last_feature:
                        OUTPUT.write("\n")
                        if OPPOSITE:
                            OPPOSITE.write("\n")

                    OUTPUT.write(plus_feature_name)
                    if OPPOSITE:
                        OPPOSITE.write(plus_feature_name)
                    last_feature = plus_feature_name

                # Write values, observing strandedness if specified
                if self.stranded_bed:
                    if self.feature_info[plus_feature_name]["strand"] == "+":
                        same_value = plus_sum
                        opposite_value = minus_sum
                    elif self.feature_info[plus_feature_name]["strand"] == "-":
                        same_value = minus_sum
                        opposite_value = plus_sum

                    OUTPUT.write("\t" + same_value)
                    if OPPOSITE:
                        OPPOSITE.write("\t" + opposite_value)
                else:
                    OUTPUT.write("\t{}".format(
                        self.checkInt(float(plus_sum)+float(minus_sum))))

            OUTPUT.write("\n")
            if OPPOSITE:
                OPPOSITE.write("\n")


@click.group()
def cli():
    """
    Generate matrices for stranded or unstranded bigWig matrices
    """


@cli.command('unstranded')
@click.argument('unstranded_bigwig')
@click.argument('feature_bed')
@click.argument('output_matrix')
@click.option('-a', '--anchor', default='center', help='Bin anchor', type=click.Choice(BedMatrix.ANCHOR_OPTIONS))
@click.option('-b', '--bin_start', default=-2500, help='Relative bin start', type=int)
@click.option('-n', '--bin_number', default=50, help='Number of bins', type=int)
@click.option('-s', '--bin_size', default=100, help='Size of bins', type=int)
def unstranded(unstranded_bigwig, feature_bed, output_matrix, **kwargs):
    """
    Run with unstranded matrix
    """
    BedMatrix(unstranded_bigwig, feature_bed, output_matrix, **kwargs)


@cli.command('stranded')
@click.argument('plus_bigwig')
@click.argument('minus_bigwig')
@click.argument('feature_bed')
@click.argument('output_matrix')
@click.option('-a', '--anchor', default='center', help='Bin anchor', type=click.Choice(BedMatrix.ANCHOR_OPTIONS))
@click.option('-b', '--bin_start', default=-2500, help='Relative bin start', type=int)
@click.option('-n', '--bin_number', default=50, help='Number of bins', type=int)
@click.option('-s', '--bin_size', default=100, help='Size of bins', type=int)
@click.option('--opposite_strand_fn', type=str, help='Output filename for opposite strand coverage')
def stranded(plus_bigwig, minus_bigwig, feature_bed, output_matrix, **kwargs):
    """
    Run with stranded matrix
    """
    BedMatrix(plus_bigwig, minus_bigwig, feature_bed, output_matrix, **kwargs)


if __name__ == '__main__':
    cli()
