from minio import Minio
from minio.error import ResponseError
import logging
__client = None


def MinioInit(host, akey, skey, secure):
    global __client
    if __client:
        return
    __client = Minio(host, access_key=akey, secret_key=skey, secure=secure)


def GetMinio():
    return __client