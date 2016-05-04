#!/usr/bin/env python
import os
import click
import subprocess


class BigWigCheck(object):

    validateFiles_path = "/ddn/gs1/home/lavenderca/validateFiles"

    def __init__(self, bigwig, chrom_sizes_file):

        assert os.path.exists(bigwig)
        assert os.path.exists(chrom_sizes_file)

        self.bigwig = bigwig
        self.chrom_sizes_file = chrom_sizes_file

        self.check_bigwig()

    def run_validate_file(self):
        proc = subprocess.Popen([
            self.validateFiles_path,
            "-chromInfo=" + self.chrom_sizes_file,
            "-type=bigWig",
            self.bigwig
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, errors = proc.communicate()

        if output != "Error count 0\n":
            raise Exception("validateFiles returns the following error:\n" + errors.strip())

    def check_bigwig(self):
        self.run_validate_file()


@click.command()
@click.argument('bigwig')
@click.argument('chrom_sizes_file')
def cli(bigwig, chrom_sizes_file):
    """
    Validate bigwig file.
    """
    BigWigCheck(bigwig, chrom_sizes_file)


if __name__ == '__main__':
    cli()
