# XDSMjs
XDSM diagram generator written in javascript. 

## XDSM
The XDSM (eXtended Design Structure Matrix) is a notation used to visualize MDO processes. 
It was developed by A. B. Lambe and J. R. R. A. Martins, see [MDOLab website dedicated page.](http://mdolab.engin.umich.edu/content/xdsm-overview)

XDSM permission:

> The XDSM LaTeX source and generator files are provided as-is and free of charge. Users are free to download, modify, and redistribute the software as they please, provided this notice remains. 

> If you use the XDSM format for research, we ask that you cite the following journal publication in your work:
> A. B. Lambe and J. R. R. A. Martins, “Extensions to the Design Structure Matrix for the Description of Multidisciplinary Design, Analysis, and Optimization Processes”, Structural and Multidisciplinary Optimization, vol. 46, no. 2, p. 273-284, 2012.

## Description
XDSMjs is a javascript generator allowing to display a XDSM diagram within a web page. 
It is based on [D3](https://d3js.org/) and [Mathjax](https://www.mathjax.org/).
Compared to the original latex generator it uses a json format as input (see example xdsm.json).

## Usage
* Edit xdsm.json
* Open xdsm.html in a browser (tested with Chrome)

## TODO
* Add multi-component representation
* Add multi-line display within component boxes 
* Add XDSM json formal description (json schema)
* Add process chaining vizualisation using D3 animation capability
* Automate components padding 
* ...
