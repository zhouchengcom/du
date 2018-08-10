

MINIO = {
    "host": "10.11.65.34:32769",
    "akey": "M4UE4EE0UV36DFSMBAC2",
    "skey": "Vu8+9SWWjn/6Hlc+AdxjZv64wCj8kMQKI5nBNNcK",
    "secure": False,
}

REDIS = "redis://10.11.65.34:6379/0"


SCAN_TYPE = ["WindowsDefender"]


BROKER_URL = 'redis://10.11.65.34:6379/3'
CELERY_RESULT_BACKEND = 'redis://10.11.65.34:6379/4'