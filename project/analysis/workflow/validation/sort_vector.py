#!/usr/bin/env python
import click
import os
import sys

from . import Validator


class SortVectorCheck(Validator):

    def __init__(self, feature_bed, sort_vector):

        super().init()

        assert os.path.exists(feature_bed)
        assert os.path.exists(sort_vector)

        self.feature_bed_fn = feature_bed
        self.sort_vector_fn = sort_vector

        self.validate()

    def is_float(self, s):
        try:
            float(s)
            return True
        except ValueError:
            return False

    def check_columns(self):
        column_check = True
        float_check = True
        with open(self.sort_vector_fn) as f:
            for line in f:
                if len(line.split("\t")) != 2:
                    column_check = False
                if not self.is_float(line.strip().split('\t')[1]):
                    float_check = False
        if not column_check:
            sys.stdout.write('Not every row has two columns!!\n')
        if not float_check:
            sys.stdout.write('Column two contains non-float values!!\n')
        return column_check and float_check

    def check_ids(self):
        with open(self.sort_vector_fn) as sort_vector_lines, \
             open(self.feature_bed_fn) as feature_bed_lines:
            for sort_vector_line, feature_bed_line in \
                    zip(sort_vector_lines, feature_bed_lines):
                if sort_vector_line.split('\t')[0] != feature_bed_line.split('\t')[3]:
                    print(sort_vector_line.split('\t')[0])
                    print(feature_bed_line.split('\t')[3])
                    sys.stdout.write('Feature bed IDs do not match sort vector!!\n')
                    return False
        return True

    def validate(self):
        self.check_columns()
        self.check_ids()


@click.command()
@click.argument('feature_bed')
@click.argument('sort_vector')
def cli(feature_bed, sort_vector):
    """
    Validate sort vector against feature bed file.
    """
    SortVectorCheck(feature_bed, sort_vector)


if __name__ == '__main__':
    cli()
