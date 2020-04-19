from shutil import copy
import json

PACKAGE_VERSION_NUMBER = None

# copy assets
copy("../build/xdsmjs.js", "xdsmjs/dist/")
copy("../fontello.css", "xdsmjs/dist/")
copy("../xdsmjs.css", "xdsmjs/dist/")

# change version
version = "0.0.0"
with open("../package.json") as pkg:
    package = json.load(pkg)
    version = package["version"]

if PACKAGE_VERSION_NUMBER:
    version += ".{}".format(PACKAGE_VERSION_NUMBER)

init = []
with open("xdsmjs/__init__.py") as f:
    init = f.readlines()

init[0] = '__version__ = "{}"\n'.format(version)

with open("xdsmjs/__init__.py", "w") as f:
    f.writelines(init)
