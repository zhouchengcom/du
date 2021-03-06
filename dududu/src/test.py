# -*- coding: utf-8 -*-
# Minio Python Library for Amazon S3 Compatible Cloud Storage, (C) 2015 Minio, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Note: YOUR-ACCESSKEYID, YOUR-SECRETACCESSKEY, my-bucketname and my-objectname
#  are dummy values, please replace them with original values.

import datetime

from minio import Minio
from minio.error import ResponseError

client = Minio('10.11.65.34:32769',
               access_key='M4UE4EE0UV36DFSMBAC2',
               secret_key='Vu8+9SWWjn/6Hlc+AdxjZv64wCj8kMQKI5nBNNcK',secure=False)

# presigned Put object URL for an object name, expires in 3 days.
try:
    client.make_bucket("my-bucketname")
    print(client.presigned_put_object('my-bucketname',
                                      'my-objectname',
                                      datetime.timedelta(days=3)))
# Response error is still possible since internally presigned does get
# bucket location.
except ResponseError as err:
    print(err)