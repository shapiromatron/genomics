from django import forms

from crispy_forms import helper as cf
from crispy_forms import layout as cfl
from crispy_forms import bootstrap as cfb


class BaseFormHelper(cf.FormHelper):

    error_text_inline = True

    def __init__(self, form=None, **kwargs):
        self.attrs = {}
        self.inputs = []
        self.kwargs = kwargs

        if form:
            self.form = form
            self.layout = self.build_default_layout(form)
            self.addButtons()

    def addButtons(self):
        btns = []
        if self.kwargs.get('submit'):
            btns.append(cfl.Submit('save', 'Save'))
        if self.kwargs.get('cancelURL'):
            btns.append(
                cfl.HTML(
                    """<a role="button" class="btn btn-default" href="{}">Cancel</a>"""
                    .format(self.kwargs.get('cancelURL'))))
        if len(btns) > 0:
            self.layout.append(cfb.FormActions(*btns, css_class="formActions"))
