from __future__ import absolute_import
from celery import Celery
import logging
from ..minioclient import MinioInit

# print("sssssssssssssssssssssssssssss")
app = Celery(include=["dudu.task.scan"])
# print("qqqqqqqqqqqqqq")

if not app.conf["BROKER_URL"]:
    if not app.config_from_envvar("DUDUCONFIG", silent=True):
        app.config_from_object("duduconfig")

MinioInit(
    app.conf["MINIO"]["host"],
    app.conf["MINIO"]["akey"],
    app.conf["MINIO"]["skey"],
    app.conf["MINIO"]["secure"],
)
