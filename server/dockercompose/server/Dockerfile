FROM python:2.7
RUN pip install gunicorn flask minio redis celery==3.1.25


EXPOSE 9988
WORKDIR /home/server


CMD ["gunicorn", "lic.web:app", "-c", "gunicorn_config.py"]
