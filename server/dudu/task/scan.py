from __future__ import absolute_import

from dudu.task.celery import app
import redis
import tempfile
from ..minioclient import GetMinio

import os
import logging
import subprocess


conf = app.conf

@app.task()
def Scan(md5, name, vtype, dburl):
    db = redis.from_url(dburl)

    key = "virus:%s:%s" % (md5, vtype)

    fun_name = "Scan" + vtype
   
    if fun_name not in globals():
        db.hset(key, "state", "end")
        db.hset(key, "result", "failure")
        db.hset(key, "msg", "Scan type is not supported")
        return

    db.hset(key, "state", "start")

    tmpfile = tempfile.NamedTemporaryFile(delete=False)

    data = GetMinio().get_object(md5, name)
    for d in data.stream(1024 * 100):
        tmpfile.write(d)
    tmpfile.close()

    try:
        result, output = globals()[fun_name](tmpfile.name)
    except Exception as e:
        logging.exception("scan fail")
        db.hset(key, "state", "end")
        db.hset(key, "result", "failure")
        db.hset(key, "msg", str(e))
        os.remove(tmpfile.name)

        return

    db.hset(key, "state", "end")
    if result:
        db.hset(key, "result", "passing")
    else:
        db.hset(key, "result", "virus")

    db.hset(key, "msg", output)
    os.remove(tmpfile.name)


def ScanWindowsDefender(filename):
    logging.info(os.environ["ProgramFiles"])
    scaner = os.environ["ProgramFiles"] + r"\Windows Defender\MpCmdRun.exe"
    logging.info(scaner)
    cmd = [scaner, "-Scan", "-ScanType", "3", "-File", filename, "-DisableRemediation"]
    
    tmpfile = tempfile.NamedTemporaryFile()
    p = subprocess.Popen(cmd, stdout=tmpfile, stderr=subprocess.STDOUT)
    returncode = p.wait()

    tmpfile.seek(0)
    output = tmpfile.read()
    tmpfile.close()
    logging.info(output)
    return returncode == 0, output
