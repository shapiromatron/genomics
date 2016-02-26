from time import sleep
from celery.utils.log import get_task_logger
from celery.decorators import task
from celery import group
from django.apps import apps
from django.utils import timezone

logger = get_task_logger(__name__)


@task()
def debug_task():
    logger.info('Starting debug task...')
    sleep(5)
    logger.info('Finishing debug task...')
    return True


@task()
def execute_analysis(analysis):

    # save current start-time
    analysis.start_time = timezone.now()
    analysis.end_time = None
    analysis.save()

    # run all feature-list count matrix
    ads_qs = analysis.analysisdatasets_set.all()\
        .prefetch_related('dataset', 'dataset__encodedataset', 'dataset__userdataset')
    job = group([
        execute_count_matrix.s(analysis, ads.dataset.subclass)
        for ads in ads_qs
    ])
    job.apply_async()

    # build feature-list matrix
    analysis.output = analysis.execute_mat2mat()
    analysis.end_time = timezone.now()
    analysis.save()


@task()
def execute_count_matrix(analysis, dataset):
    FeatureListCountMatrix = apps.get_model('analysis', 'FeatureListCountMatrix')
    FeatureListCountMatrix.execute(analysis, dataset)
