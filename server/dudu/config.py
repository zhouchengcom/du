from flask import Config

conf = Config("")


def SetConfig(c):
    conf.update(c)
