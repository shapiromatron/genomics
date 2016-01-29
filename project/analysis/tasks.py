from time import sleep
from celery.utils.log import get_task_logger
from celery.decorators import task

logger = get_task_logger(__name__)


@task()
def debug_task():
    logger.info('Starting debug task...')
    sleep(5)
    logger.info('Finishing debug task...')
    return True
