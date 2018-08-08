from __future__ import absolute_import
from celery import Celery

from ..minioclient import MinioInit

app = Celery(include=[])

if not app.conf.broker_url:
    if not app.config_from_envvar("DUDUCONFIG", silent=True):
        app.config_from_object("duduconfig")


MinioInit(
    app.conf["MINIO"]["host"],
    app.conf["MINIO"]["akey"],
    app.conf["MINIO"]["skey"],
    app.conf["MINIO"]["secure"],
)
