import datetime
import logging

import time
from flask import Blueprint, jsonify, request
from .minioclient import GetMinio
import uuid
import tempfile
import redis
from .config import conf

mod = Blueprint("virus", __name__)


@mod.route("/uplaodurl", methods=["GET"])
def UploadUrl():
    if "uid" not in request.cookies:
        return "", 404
    uid = request.cookies.get("uid")
    if not GetMinio().bucket_exists(uid):
        GetMinio().make_bucket(uid)

    name = uuid.uuid4().hex[:12]

    url = GetMinio().presigned_put_object(uid, name, expires=timedelta(hours=2))
    return jsonify({"url": url, "name": name})


@mod.route("/finishupload/<name>", methods=["GET"])
def UploadUrl(name):
    if "uid" not in request.cookies:
        return "", 404
    uid = request.cookies.get("uid")

    tmp = tempfile.NamedTemporaryFile()

    try:
        GetMinio().fget_object(uid, name, tmp.name)
    except ResponseError as err:
        return "not find file", 400

    hash_md5 = hashlib.md5()
    with open(tmp.name, "rb") as f:

        file_buffer = kali_file.read(40960)
        while len(file_buffer) > 0:
            hash_md5.update(file_buffer)
            file_buffer = kali_file.read(40960)
    md5 = hash_md5.hexdigest()

    if GetMinio().bucket_exists(md5):
        return jsonify({"md5": md5})

    GetMinio().make_bucket(md5)
    GetMinio().copy_object(md5, name, f"/{md5}/{name}")
    GetMinio().remove_object(uid, name)

    db = redis.from_url(conf["REDIS"])
    for v in conf["SCAN_TYPE"]:
        key = "%s:%s" % (md5, v)
        db.hset(key, "state", "waiting")
        db.hset(key, "create_time", int(time.time()))

    return jsonify({"md5": md5})


@mod.route("/scan/<name>", methods=["GET"])
def GetScanResult(name):
    if not GetMinio().bucket_exists(name):
        return "not find file", 400

    db = redis.from_url(conf["REDIS"])
    result = {}
    for v in conf["SCAN_TYPE"]:
        key = "%s:%s" % (md5, v)
        value = db.hgetall(key)
        result[v] = value

    return jsonify(result)
