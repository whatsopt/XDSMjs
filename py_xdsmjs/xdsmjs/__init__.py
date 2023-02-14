__version__ = "2.0.0"

import os


def read(filename):

    result_string = None
    with open(os.path.join(os.path.dirname(__file__), "dist", filename)) as f:
        result_string = f.read()

    return result_string


def bundlejs():
    return read("xdsmjs.js")


def css():
    return "{}\n{}".format(read("fontello.css"), read("xdsmjs.css"))
