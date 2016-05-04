from time import sleep
from celery.utils.log import get_task_logger
from celery.decorators import task
from celery import group, chain
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
def execute_analysis(analysis_id):

    # reset analysis object to pre-analysis mode
    task1 = reset_analysis_startup.si(analysis_id)

    # run all feature-list count matrix in parallel
    EncodeDataset = apps.get_model('analysis', 'EncodeDataset')
    analysis = apps.get_model('analysis', 'Analysis').objects.get(id=analysis_id)
    ads_qs = analysis.analysisdatasets_set.all()\
        .prefetch_related('dataset', 'dataset__encodedataset', 'dataset__userdataset')
    task2 = group([
        execute_count_matrix.si(
            analysis.id,
            ads.id,
            isinstance(ads.dataset.subclass, EncodeDataset),
            ads.dataset.subclass.id)
        for ads in ads_qs
    ])

    # after completion, build combinatorial result and save
    task3 = execute_matrix_combination.si(analysis_id)

    # chain tasks to be performed serially
    return chain(task1, task2, task3)()


@task()
def reset_analysis_startup(analysis_id):
    # save current start-time
    analysis = apps.get_model('analysis', 'Analysis').objects.get(id=analysis_id)
    analysis.start_time = timezone.now()
    analysis.end_time = None
    analysis.save()
    analysis.init_execution_status()


@task()
def execute_count_matrix(analysis_id, ads_id, isEncode, dataset_id):
    # execute each count matrix
    analysis = apps.get_model('analysis', 'Analysis').objects.get(id=analysis_id)
    ads = apps.get_model('analysis', 'AnalysisDatasets').objects.get(id=ads_id)
    if isEncode:
        dataset = apps.get_model('analysis', 'EncodeDataset').objects.get(id=dataset_id)
    else:
        dataset = apps.get_model('analysis', 'UserDataset').objects.get(id=dataset_id)
    FeatureListCountMatrix = apps.get_model('analysis', 'FeatureListCountMatrix')
    ads.count_matrix = FeatureListCountMatrix.execute(analysis, dataset)
    ads.save()
    analysis.increment_execution_status()


@task()
def execute_matrix_combination(analysis_id):
    # save results from matrix combination
    analysis = apps.get_model('analysis', 'Analysis').objects.get(id=analysis_id)
    analysis.output = analysis.execute_mat2mat()
    analysis.end_time = timezone.now()
    analysis.save()
    analysis.increment_execution_status()


@task()
def download_dataset(id_):
    dd = apps.get_model('analysis', 'DatasetDownload').objects.get(id=id_)
    dd.download()


@task()
def validate_feature_list(id_):
    obj = apps.get_model('analysis', 'FeatureList').objects.get(id=id_)
    obj.validate_and_save()


@task()
def validate_sort_vector(id_):
    obj = apps.get_model('analysis', 'SortVector').objects.get(id=id_)
    obj.validate_and_save()


@task()
def validate_analysis(id_):
    obj = apps.get_model('analysis', 'Analysis').objects.get(id=id_)
    obj.validate_and_save()
