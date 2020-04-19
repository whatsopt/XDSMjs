__version__ = "0.8.0"

__all__ = ["bundlejs", "css"]

import os


def read(filename):

    result_string = None
    with open(os.path.join(os.path.dirname(__file__), "dist", filename)) as f:
        result_string = f.read()

    return result_string


def bundlejs():
    return read("xdsm.bundle.js")


def css():
    return "{}\n{}".format(read("fontello.css"), read("xdsm.css"))
