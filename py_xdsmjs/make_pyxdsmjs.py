import os
from shutil import copy
import json

PACKAGE_RELEASE_NUMBER = None

if not os.path.exists("xdsmjs/dist"):
    os.makedirs("xdsmjs/dist")

# copy assets
copy("../dist/xdsmjs.js", "xdsmjs/dist/")
copy("../fontello.css", "xdsmjs/dist/")
copy("../xdsmjs.css", "xdsmjs/dist/")

# change version
version = "0.0.0"
with open("../package.json") as pkg:
    package = json.load(pkg)
    version = package["version"]

if PACKAGE_RELEASE_NUMBER:
    version += ".{}".format(PACKAGE_RELEASE_NUMBER)

init = []
with open("xdsmjs/__init__.py") as f:
    init = f.readlines()

init[0] = '__version__ = "{}"\n'.format(version)

with open("xdsmjs/__init__.py", "w") as f:
    f.writelines(init)
