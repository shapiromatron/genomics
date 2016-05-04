#!/usr/bin/env python
import os
import sys
import click
import subprocess

from .base import Validator


class BigWigValidator(Validator):

    def __init__(self, bigwig, chrom_sizes_file):

        super().__init__()

        assert os.path.exists(bigwig)
        assert os.path.exists(chrom_sizes_file)

        self.bigwig = bigwig
        self.chrom_sizes_file = chrom_sizes_file

    def get_executable(self):
        root = os.path.abspath(
            os.path.pardir(os.path.dirname(os.path.abspath(__file__)))
        )
        path = os.path.join(root, 'validateFiles')
        if not os.path.exists(path):
            raise IOError('validateFiles not found, expected {}'.format(path))
        return path

    def validate(self):
        executable = self.get_executable()
        proc = subprocess.Popen([
            executable,
            "-chromInfo=" + self.chrom_sizes_file,
            "-type=bigWig",
            self.bigwig
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        output, errors = proc.communicate()
        output = output.decode(encoding='UTF-8')
        errors = errors.decode(encoding='UTF-8')

        if output != 'Error count 0\n':
            outputs = output.splitlines()
            self.add_errors(outputs)

        if errors:
            errors = errors.splitlines()
            self.add_errors(errors)


@click.command()
@click.argument('bigwig')
@click.argument('chrom_sizes_file')
def cli(bigwig, chrom_sizes_file):
    """
    Validate bigwig file.
    """
    validator = BigWigValidator(bigwig, chrom_sizes_file)
    validator.validate()
    sys.stdout.write(validator.display_errors())


if __name__ == '__main__':
    cli()
