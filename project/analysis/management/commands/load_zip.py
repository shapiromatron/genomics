import json
import zipfile
import os
import shutil
import tempfile

from uuid import uuid4

from django.conf import settings
from django.core.management.base import BaseCommand

from analysis import models
from myuser.models import User


HELP_TEXT = """Load zipped analysis into location application for development."""


class Command(BaseCommand):

    help = HELP_TEXT

    def add_arguments(self, parser):
        parser.add_argument('zipfile')

    def handle(self, *args, **options):

        zip_ = options.get('zipfile')
        if not os.path.exists(zip_):
            return self.stdout.write('Zipfile not found: {}'.format(zip_))

        cont = input('Delete all existing analyses and load new? [y or n]: ')
        if cont.lower() != 'y':
            return self.stdout.write('Canceled by user.')

        root = settings.MEDIA_ROOT
        with zipfile.ZipFile(zip_, 'r') as z:
            tdir = tempfile.mkdtemp()
            z.extractall(tdir)

        filenames = z.namelist()

        # delete old content
        models.FeatureList.objects.all().delete()
        models.Analysis.objects.all().delete()
        models.FeatureListCountMatrix.objects.all().delete()

        # select user
        user = User.objects.all()[0]

        # create feature-list
        fl_name = os.path.join(root, "{}.txt".format(uuid4()))
        shutil.copy(os.path.join(tdir, 'feature_list.txt'), fl_name)
        fl = models.FeatureList.objects.create(
            owner=user,
            name='demo1',
            genome_assembly=1,
            stranded=True,
            dataset=os.path.basename(fl_name),
        )

        # create sort-vector
        sv = None
        sv_path = os.path.join(tdir, 'sort_vector.txt')
        if os.path.exists(sv_path):
            sv = models.SortVector.objects.create(
                owner=user,
                name='demo1',
                feature_list=fl,
                text=open(sv_path, 'r').read(),
            )

        # create analysis
        an = models.Analysis.objects.create(
            owner=user,
            name='demo1',
            genome_assembly=1,
            feature_list=fl,
            sort_vector=sv,
        )

        # save analysis datasets. Note that we randomly associate each
        # count matrix with an encode-dataset,
        # to make it easier for assignment.

        cmroot = os.path.join(tdir, 'count_matrix')
        fns = os.listdir(cmroot)
        ds = models.EncodeDataset.objects.all()[:len(fns)]
        cm_ids = []
        for i, fn in enumerate(fns):

            root_name = os.path.join(models.FeatureListCountMatrix.UPLOAD_TO, fn)
            shutil.copy(
                os.path.join(cmroot, fn),
                os.path.join(root, root_name)
            )

            cm = models.FeatureListCountMatrix.objects.create(
                feature_list=fl,
                dataset=ds[i],
                matrix=root_name,
            )
            cm_ids.append(cm.id)

            adm = models.AnalysisDatasets.objects.create(
                analysis=an,
                dataset=ds[i],
                display_name=os.path.splitext(root_name)[0],
                count_matrix=cm
            )

            an.analysisdatasets_set.add(adm)

        # Update output IDs to match new ones in database
        with open(os.path.join(tdir, 'output.json'), 'r') as f:
            output = json.loads(f.read())
        output['matrix_ids'] = cm_ids
        an_fn = "{}.json".format(uuid4())
        with open(os.path.join(root, models.Analysis.UPLOAD_TO, an_fn), 'w') as f:
            f.write(json.dumps(output))

        an.output = os.path.join(models.Analysis.UPLOAD_TO, an_fn)
        an.save()

        # remove temporary path
        shutil.rmtree(tdir)
