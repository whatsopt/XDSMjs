/*
 * XDSMjs
 * Copyright 2016 Rémi Lafage
 */
"use strict";

var d3 = require('d3');
var Graph = require('./src/graph');
var Xdsm = require('./src/xdsm');
var Animation = require('./src/animation');

d3.json("xdsm.json", function(error, mdo) {
  if (error) {
    throw error;
  }

  var tooltip = d3.select("body").selectAll(".tooltip").data(['tooltip'])
                  .enter().append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

  var scenarioKeys = Object.keys(mdo).sort();
  var xdsms = {};
  if (scenarioKeys.indexOf('root') === -1) {
    // old format: mono xdsm
    var graph = new Graph(mdo);
    xdsms['root'] = new Xdsm(graph, 'root');
    xdsms['root'].draw();
  } else {
    // new format managing several XDSM
    scenarioKeys.forEach(function(k) {
      if (mdo.hasOwnProperty(k)) {
        var graph = new Graph(mdo[k], k);
        xdsms[k] = new Xdsm(graph, k, tooltip);
        xdsms[k].draw();
      }
    }, this);
  }

  var anim = new Animation(xdsms);
  anim.run();
});

