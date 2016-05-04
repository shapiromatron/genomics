#!/usr/bin/env python
import click
import os
import sys


class BinValueCheck(object):

    ANCHOR_OPTIONS = ('start', 'end', 'center')
    max_window_size = 100000
    max_bin_number = 250

    def __init__(self, bin_anchor, bin_start,
                 bin_number, bin_size, feature_bed,
                 chrom_sizes, stranded_bed):

        # Type checks
        assert isinstance(bin_anchor, str)
        assert isinstance(bin_start, int)
        assert isinstance(bin_number, int)
        assert isinstance(bin_size, int)

        assert os.path.exists(feature_bed)
        assert os.path.exists(chrom_sizes)

        # Set instance variables
        self.bin_anchor = bin_anchor
        self.bin_start = bin_start
        self.bin_number = bin_number
        self.bin_size = bin_size
        self.feature_bed_fn = feature_bed
        self.chrom_sizes_fn = chrom_sizes
        self.stranded_bed = stranded_bed

        # Execute
        self.checkValues()

    def checkNegatives(self):
        if self.bin_number < 1:
            sys.stdout.write('bin_number is less than 1!!\n')
            return False
        if self.bin_size < 1:
            sys.stdout.write('bin_size is less than 1!!\n')
            return False
        return True

    def readChrom(self, chrom_sizes_fn):
        chrom_sizes = dict()
        with open(chrom_sizes_fn) as f:
            for line in f:
                chromosome, size = line.strip().split('\t')
                chrom_sizes[chromosome] = int(size)
        return chrom_sizes

    def checkHeader(self, line):
        # Check to see if line is header
        if line == '\n':
            return True
        elif line[0] == '#':
            return True
        elif line.split()[0].lower() in ('track', 'browser'):
            return True
        else:
            return False

    def checkIfOutside(self):
        chrom_sizes = self.readChrom(self.chrom_sizes_fn)
        with open(self.feature_bed_fn) as f:
            for line in f:
                if not self.checkHeader(line):
                    bed_fields = len(line.strip().split())
                    chromosome, start, end = line.strip().split()[0:3]
                    start = int(start) + 1  # Convert from 0-based to 1-based
                    end = int(end)
                    center = int((start + end) / 2)
                    if self.stranded_bed:
                        if bed_fields >= 6:  # Contains strand information?
                            strand = line.strip().split()[5]
                        else:
                            raise ValueError('BED file lacks strand column!!')
                    else:
                        strand = 'AMBIG'
                    # Define start and end points for window
                    if self.bin_anchor == 'center':
                        if strand == '+' or strand == 'AMBIG':
                            window_start = center + self.bin_start
                        if strand == '-':
                            window_start = center - self.bin_start
                    elif self.bin_anchor == 'start':
                        if strand == '+' or strand == 'AMBIG':
                            window_start = start + self.bin_start
                        if strand == '-':
                            window_start = end - self.bin_start
                    elif self.bin_anchor == 'end':
                        if strand == '+' or strand == 'AMBIG':
                            window_start = end + self.bin_start
                        if strand == '-':
                            window_start = start - self.bin_start

                    if strand == '+' or strand == 'AMBIG':
                        window_end = window_start + self.bin_size * self.bin_number
                    elif strand == '-':
                        window_end = window_start - self.bin_size * self.bin_number

                    if strand == '+' or strand == 'AMBIG':
                        if window_start < 1 or window_end > chrom_sizes[chromosome]:
                            sys.stdout.write('Feature window extends outside chromosome!!\n')
                            return False
                    if strand == '-':
                        if window_start > chrom_sizes[chromosome] or window_end < 1:
                            sys.stdout.write('Feature window extends outside chromosome!!\n')
                            return False
        return True

    def checkWindowSize(self):
        if self.bin_size * self.bin_number > self.max_window_size:
            sys.stdout.write('Window size exceeds maximum allowed!!\n')
            return False
        return True

    def checkBinNumber(self):
        if self.bin_number > self.max_bin_number:
            sys.stdout.write('Bin number exceeds maximum allowed!!\n')
            return False
        return True

    def checkValues(self):
        self.checkNegatives()
        self.checkIfOutside()
        self.checkWindowSize()
        self.checkBinNumber()


@click.command()
@click.argument('bin_anchor', type=click.Choice(BinValueCheck.ANCHOR_OPTIONS))
@click.argument('bin_start', type=int)
@click.argument('bin_number', type=int)
@click.argument('bin_size', type=int)
@click.argument('feature_bed', type=str)
@click.argument('chrom_sizes', type=str)
@click.option('--stranded_bed', is_flag=True, help='Expect stranded bed')
def cli(bin_anchor, bin_start, bin_number,
        bin_size, feature_bed, chrom_sizes,
        stranded_bed):
    """
    Check and validate window parameters for analysis.
    """
    BinValueCheck(
        bin_anchor, bin_start, bin_number,
        bin_size, feature_bed, chrom_sizes,
        stranded_bed)


if __name__ == '__main__':
    cli()
