import itertools
import json
from django import forms

from utils.forms import BaseFormHelper

from . import models


class BaseFormMixin(object):
    """
    - Set the owner if specified.
    - Generate basic crispy form template
    """

    CREATE_LEGEND = None
    CREATE_HELP_TEXT = None

    def __init__(self, *args, **kwargs):
        owner = kwargs.pop('owner', None)
        super().__init__(*args, **kwargs)
        if owner:
            self.instance.owner = owner

        self.helper = self.setHelper()

    def setHelper(self):

        for fld in self.fields.keys():
            widget = self.fields[fld].widget
            if type(widget) != forms.CheckboxInput:
                widget.attrs['class'] = 'span12'

        inputs = {}

        if self.instance.id:
            # update
            inputs["legend_text"] = 'Update {}'.format(self.instance)
        else:
            # create
            if self.CREATE_LEGEND:
                inputs["legend_text"] = self.CREATE_LEGEND

            if self.CREATE_HELP_TEXT:
                inputs["help_text"] = self.CREATE_HELP_TEXT

        helper = BaseFormHelper(self, **inputs)
        return helper


class UserDatasetForm(BaseFormMixin, forms.ModelForm):
    CREATE_LEGEND = 'Create user dataset'

    class Meta:
        model = models.UserDataset
        exclude = (
            'owner', 'borrowers', 'validated',
            'url', 'expiration_date',
        )


class FeatureListForm(BaseFormMixin, forms.ModelForm):
    CREATE_LEGEND = 'Create feature list'

    class Meta:
        model = models.FeatureList
        exclude = ('owner', 'borrowers', 'validated', )


class SortVectorForm(BaseFormMixin, forms.ModelForm):
    CREATE_LEGEND = 'Create sort vector'
    CREATE_HELP_TEXT = 'Help text...'

    class Meta:
        model = models.SortVector
        exclude = ('owner', 'borrowers', 'validated', )


class DatasetField(forms.CharField):

    def get_datasets(self, value):
        d = json.loads(value)
        return {
            'userDatasets': d.get('userDatasets', []),
            'encodeDatasets': d.get('encodeDatasets', []),
        }

    def is_valid(self, cleaned):
        d = self.get_datasets(cleaned)
        if len(d['userDatasets']) + len(d['encodeDatasets']) < 2:
            raise forms.ValidationError("At least two datasets are required.")

        for obj in itertools.chain(d['userDatasets'], d['encodeDatasets']):
            if 'dataset' not in obj or 'display_name' not in obj:
                raise forms.ValidationError("At least two datasets are required.")

        return True

    def clean(self, value):
        # ensure valid JSON
        try:
            json.loads(value)
            return value
        except json.decoder.JSONDecodeError:
            raise forms.ValidationError('JSON format required.')


class AnalysisForm(BaseFormMixin, forms.ModelForm):
    CREATE_LEGEND = 'Create analysis'

    datasets_json = DatasetField(widget=forms.Textarea)

    class Meta:
        model = models.Analysis
        fields = (
            'name', 'description', 'genome_assembly',
            'feature_list', 'sort_vector', 'public',
            'anchor', 'bin_start', 'bin_size',
            'bin_number',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['feature_list'].queryset = \
            models.FeatureList.objects.filter(owner=self.instance.owner)
        self.fields['sort_vector'].queryset = \
            models.SortVector.objects.filter(owner=self.instance.owner)

    def clean(self):
        cleaned_data = super().clean()

        ds = cleaned_data['datasets_json']
        if not self.fields['datasets_json'].is_valid(ds):
            raise forms.ValidationError("Improper dataset specification")

