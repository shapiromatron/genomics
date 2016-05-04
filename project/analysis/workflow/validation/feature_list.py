#!/usr/bin/env python
import os
import click
import subprocess


class FeatureListCheck(object):

    validateFiles_path = "/ddn/gs1/home/lavenderca/validateFiles"

    def __init__(self, feature_list, chrom_sizes_file):

        assert os.path.exists(feature_list)
        assert os.path.exists(chrom_sizes_file)

        self.feature_list = feature_list
        self.chrom_sizes_file = chrom_sizes_file

        self.check_feature_list()

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

    def find_col_number(self):
        # Find number of columns in bed
        with open(self.feature_list) as f:
            for line in f:
                if not (self.checkHeader(line)):
                    self.col_number = len(line.split())
                    break

    def run_validate_file(self):
        proc = subprocess.Popen([
            self.validateFiles_path,
            "-chromInfo=" + self.chrom_sizes_file,
            "-type=bed" + str(self.col_number),
            self.feature_list
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, errors = proc.communicate()

        if output != "Error count 0\n":
            raise Exception("validateFiles returns the following error:\n" + errors.strip())

    def check_feature_names(self):
        # If BED file contains names (cols >= 4), make sure they are unique
        used_feature_names = []
        with open(self.feature_list) as f:
            for line in f:
                if not (self.checkHeader(line)):
                    feature_name = line.strip().split()[3]
                    if feature_name in used_feature_names:
                        raise Exception("Feature list includes duplicate feature names!!")
                        break
                    else:
                        used_feature_names.append(feature_name)

    def check_feature_list(self):
        self.find_col_number()

        self.run_validate_file()
        if self.col_number >= 4:
            self.check_feature_names()


@click.command()
@click.argument('feature_list')
@click.argument('chrom_sizes_file')
def cli(feature_list, chrom_sizes_file):
    """
    Validate feature_list file.
    """
    FeatureListCheck(feature_list, chrom_sizes_file)


if __name__ == '__main__':
    cli()
