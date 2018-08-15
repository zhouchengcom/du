import datetime
import logging

import time
from flask import Blueprint, jsonify, request
from .minioclient import GetMinio
import uuid
import tempfile
import redis
from .config import conf

from minio import ResponseError
import hashlib
from datetime import timedelta
from .task.scan import Scan
import json
from urlparse import urlparse

mod = Blueprint("virus", __name__)


@mod.route("/uplaodurl/<path:name>", methods=["GET"])
def UploadUrl(name):
    if "uid" not in request.cookies:
        return "", 404
    uid = request.cookies.get("uid")
    if len(uid) != 32:
        return "", 404

    if not GetMinio().bucket_exists(uid):
        GetMinio().make_bucket(uid)

    # name = uuid.uuid4().hex[:12]

    url = GetMinio().presigned_put_object(uid, name, expires=timedelta(hours=2))
    parseresult = urlparse(url)

    url = url.replace(
        parseresult.scheme + "://" + parseresult.netloc,
        parseresult.scheme + "://" + conf["HOST"] + "/minio",
    )
    return jsonify({"url": url, "name": name})


@mod.route("/finishupload/<name>", methods=["GET"])
def FinishUpload(name):
    if "uid" not in request.cookies:
        return "", 404
    uid = request.cookies.get("uid")

    try:
        data = GetMinio().get_object(uid, name)
        hash_md5 = hashlib.md5()
        for d in data.stream(1024 * 32):
            hash_md5.update(d)

        md5 = hash_md5.hexdigest()
        if GetMinio().bucket_exists(md5):
            logging.info("aleady exits file")
            return jsonify({"md5": md5})

        GetMinio().make_bucket(md5)

        policy_read_only = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "",
                    "Effect": "Allow",
                    "Principal": {"AWS": "*"},
                    "Action": "s3:GetBucketLocation",
                    "Resource": "arn:aws:s3:::%s" % md5,
                },
                {
                    "Sid": "",
                    "Effect": "Allow",
                    "Principal": {"AWS": "*"},
                    "Action": "s3:ListBucket",
                    "Resource": "arn:aws:s3:::%s" % md5,
                },
                {
                    "Sid": "",
                    "Effect": "Allow",
                    "Principal": {"AWS": "*"},
                    "Action": "s3:GetObject",
                    "Resource": "arn:aws:s3:::%s/*" % md5,
                },
            ],
        }
        logging.info(md5)
        GetMinio().set_bucket_policy(md5, json.dumps(policy_read_only))
        GetMinio().copy_object(md5, name, "/%s/%s" % (uid, name))
        GetMinio().remove_object(uid, name)
    except ResponseError as err:
        return "not find file", 400

    db = redis.from_url(conf["REDIS"])

    createTime = int(time.time())
    scanviruskey = "virus:%s" % md5
    db.hset(scanviruskey, "state", "start")
    db.hset(scanviruskey, "createTime", createTime)
    db.hset(scanviruskey, "name", name)
    db.hset(scanviruskey, "md5", md5)

    for v in conf["SCAN_TYPE"]:
        key = "virus:%s:%s" % (md5, v)
        db.hset(key, "state", "waiting")
        db.hset(key, "start_time", int(time.time()))

        Scan.apply_async((md5, name, v, conf["REDIS"]), queue=v)

    return jsonify(
        {"md5": md5, "name": name, "createTime": createTime, "state": "start"}
    )


@mod.route("/scan/<name>", methods=["GET"])
def GetScanResult(name):
    scanviruskey = "virus:%s" % name
    db = redis.from_url(conf["REDIS"])

    if not db.exists(scanviruskey):
        return "not find result", 400

    result = {"list": {}}
    result.update(db.hgetall(scanviruskey))
    finish = True
    for v in conf["SCAN_TYPE"]:
        key = "virus:%s:%s" % (name, v)
        value = db.hgetall(key)
        result["list"][v] = value
        if "state" in value:
            if value["state"] != "end":
                finish = False
    if finish:
        result["state"] = "end"
    return jsonify(result)


@mod.route("/scan/types", methods=["GET"])
def ScanTypes():
    return jsonify(conf["SCAN_TYPE"])
