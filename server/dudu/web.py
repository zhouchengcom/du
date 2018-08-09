import logging

from flask import Flask
# from flask_cors import CORS

from .virus import mod as virusmod
from .minioclient import MinioInit
from .config import SetConfig

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

if "gunicorn.error" in logging.Logger.manager.loggerDict:
    logging.root = logging.getLogger("gunicorn.error")
    app.logger.addHandler(logging.getLogger("gunicorn.error"))

if not app.config.from_envvar("DUDUCONFIG", silent=True):
    app.config.from_pyfile("../duduconfig.py")

SetConfig(app.config)
app.config["TRAP_BAD_REQUEST_ERRORS"] = True

# CORS(app)

app.config["TEMPLATES_AUTO_RELOAD"] = True


MinioInit(
    app.config["MINIO"]["host"],
    app.config["MINIO"]["akey"],
    app.config["MINIO"]["skey"],
    app.config["MINIO"]["secure"],
)





# app.session_interface = MongoEngineSessionInterface(db)
app.register_blueprint(virusmod, url_prefix="/api")


if __name__ == "__main__":
    app.run()
