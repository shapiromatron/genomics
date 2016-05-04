from abc import abstractmethod


class Validator(object):

    def __init__(self):
        self.is_valid = False
        self.validation_errors = []

    @abstractmethod
    def validate(self):
        pass

    def add_error(self, txt):
        self.validation_errors.append(txt)

    def add_errors(self, lst):
        self.validation_errors.extend(lst)

    @property
    def is_valid(self):
        return len(self.validation_errors) == 0

    def display_errors(self):
        return '\n'.join(self.validation_errors)
