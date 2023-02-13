# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

## [2.0.0] - 2023-02-13

### Changed

- Update dependencies: d3 v7
- Use `viewBox` attribute to make the svg really scalable in the container element
- Declare `xdsmjs` an ESM module only (`type: 'module'` in `package.json`, ie require node `v12+`)  


## [1.0.0] - 2020-09-23

### Changed

- Update dependencies: d3 v6


## [0.8.1] - 2020-04-28

### Fixed

- Fix packaging to publish on npm
- Fix XDSMjs API :  add `createSelectableXdsm(xdsmFormat, callback)`


## [0.8.0] - 2019-12-05

### Added

- Add configuration and xdsm data passing from `<script>` element in the HTML file
- Add links on subxdsms
- Add [xdsmjs python module](https://pypi.org/project/xdsmjs/) to expose XDSMjs assets and ease usage from Python

### Changed

- Upgrade dependencies


## [0.7.0] - 2019-12-05

### Added

- Support XDSM v2
- Add eslint airbnb config

### Changed 

- Upgrade dependencies


## [0.6.0] - 2019-02-25

This version is embedded in [OpenMDAO 2.6](https://github.com/OpenMDAO/OpenMDAO)

### Added

- Support utf-8 characters as variable names (see #2)
- Allow to specify json data through data attributes (see #4)
- Embed fontello icons (see #6)
 

## [0.5.0] - 2018-12-07

### Added

- Add XDSMjs display configuration : `config.labelizer` and `config.layout`
- Manage optional node status: vPENDING`, `RUNNING`, `FAILED`, `DONE`
- Basic XDSM edition (undocumented, experimental) 