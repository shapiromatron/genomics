import os
import random
import shutil

from django.conf import settings
from django.core.management.base import BaseCommand

from analysis import models
from myuser.models import User


HELP_TEXT = """
Run example analysis.

Requires a path to a list of bigWig files, and a feature list file. Will
load the bigWig files into the database, and move them to the encode data path,
with a number of assumptions on the analysis to be conducted.

Note that the script moves input files to locations which are accessible by
the web-application. To repeat an analysis, you may want to move the files
back to run again. You'll need to provide the random ID appended to input files
to ensure no conflict.

Example call for a new analysis:
python manage.py run_example_analysis /path/to/bigWigs /path/to/featureList.bed

Example call to move files back to original location (with specified ID):
python manage.py run_example_analysis /path/to/bigWigs /path/to/featureList.bed --reverse=1322

"""


class Command(BaseCommand):

    help = HELP_TEXT

    def add_arguments(self, parser):
        parser.add_argument('dataset_path')
        parser.add_argument('feature_list_path')

        parser.add_argument(
            '--reverse',
            action='store',
            dest='reverse_id',
            default=None,
            help='Undo; move files back to original location'
        )

    def handle_reverse(self, options):
        reverse_id = options.get('reverse_id')
        dataset_path = options.get('dataset_path')
        fl_path = options.get('feature_list_path')

        # move encode files back to original location
        encodes = [
            fn for fn in os.listdir(settings.ENCODE_PATH)
            if reverse_id in fn
        ]
        for name in encodes:
            shutil.move(
                os.path.join(settings.ENCODE_PATH, name),
                os.path.join(dataset_path, name.replace(reverse_id, '')),
            )

        # move feature-list back
        for fn in os.listdir(settings.MEDIA_ROOT):
            if reverse_id in fn:
                shutil.move(
                    os.path.join(settings.MEDIA_ROOT, fn),
                    os.path.join(fl_path),
                )

    def handle(self, *args, **options):
        if options.get('reverse_id'):
            return self.handle_reverse(options)

        # get superuser
        su = User.objects.filter(is_superuser=True).first()
        if su is None:
            raise ValueError("Requires a super user to be created")
        else:
            print("Saving run to '{}' account in application.".format(su))

        # ensure dataset path exists
        dataset_path = options.get('dataset_path')
        if not os.path.exists(dataset_path) or not os.path.isdir(dataset_path):
            raise ValueError("Dataset path not found. ")

        # ensure feature-list path exists
        fl_path = options.get('feature_list_path')
        if not os.path.exists(fl_path) or not os.path.isfile(fl_path):
            raise ValueError("Feature list not found. ")

        # create new Encode datasets; assume all data are ambiguous
        encodes = [
            fn for fn in os.listdir(dataset_path)
            if '.bigwig' in fn.lower()
        ]
        randint_ = str(random.randint(0, 32768))
        self.stdout.write('Using {} as random renaming seed.'.format(randint_))

        if not os.path.exists(settings.ENCODE_PATH):
            os.makedirs(settings.ENCODE_PATH)

        # Create encode datasets
        eds = []
        for encode in encodes:
            from_path = os.path.join(dataset_path, encode)
            new_fn = randint_ + encode
            to_path = os.path.join(settings.ENCODE_PATH, new_fn)
            shutil.move(from_path, to_path)
            ed = models.EncodeDataset.objects.create(
                data_ambiguous=new_fn,
                genome_assembly=1,
                data_type='example',
                cell_type='cell_type',
                name=os.path.splitext(encode)[0],
                public=True,
                validated=True,
            )
            eds.append(ed)

        # Create feature-list
        from_path = os.path.join(fl_path)
        new_fn = randint_ + os.path.basename(fl_path)
        to_path = os.path.join(settings.MEDIA_ROOT, new_fn)
        shutil.move(from_path, to_path)
        fl = models.FeatureList.objects.create(
            owner=su,
            genome_assembly=1,
            stranded=True,
            dataset=new_fn,
            name=os.path.basename(os.path.splitext(fl_path)[0]),
            public=True,
            validated=True,
        )

        # no sort-vector (for now...)

        # create analysis
        an = models.Analysis.objects.create(
            owner=su,
            name='Example session {}'.format(randint_),
            anchor=1,
            bin_start=2500,
            bin_number=50,
            bin_size=100,
            genome_assembly=1,
            feature_list=fl,
            validated=True,
            public=True,
        )

        for ds in eds:
            adm = models.AnalysisDatasets.objects.create(
                analysis=an,
                dataset=ds,
                display_name=ds.name,
            )
            an.analysisdatasets_set.add(adm)

        an.execute()
