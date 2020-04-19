#!/usr/bin/env python

from setuptools import setup
from xdsmjs import __version__

version = __version__
PKG_VERSION_NUMBER = None
if PKG_VERSION_NUMBER:
    version += ".{}".format(PKG_VERSION_NUMBER)

CLASSIFIERS = """
Development Status :: 4 - Beta
Intended Audience :: Science/Research
Intended Audience :: Developers
License :: OSI Approved :: Apache Software License
Programming Language :: Python :: 3
Topic :: Software Development
Topic :: Scientific/Engineering
Operating System :: Microsoft :: Windows
Operating System :: Unix
Operating System :: MacOS
"""

setup(
    name="xdsmjs",
    version=version,
    description="XDSMjs Python module",
    author="Rémi Lafage",
    author_email="remi.lafage@onera.fr",
    license="Apache License, Version 2.0",
    classifiers=[_f for _f in CLASSIFIERS.split("\n") if _f],
    packages=["xdsmjs"],
    package_data={"xdsmjs": ["dist/xdsmjs.js", "dist/xdsmjs.css", "dist/fontello.css"]},
    url="https://github.com/OneraHub/XDSMjs",
)
