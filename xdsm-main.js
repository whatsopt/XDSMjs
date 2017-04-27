/*
 * XDSMjs
 * Copyright 2016 Rémi Lafage
 */
"use strict";

var d3 = require('d3');
var Graph = require('./src/graph');
var Xdsm = require('./src/xdsm');
var Animation = require('./src/animation');
var Controls = require('./src/controls');

d3.json("xdsm.json", function(error, mdo) {
  if (error) {
    throw error;
  }

  // Tooltip for variable connexions
  var tooltip = d3.select("body").selectAll(".tooltip").data(['tooltip'])
                  .enter().append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

  var scenarioKeys = Object.keys(mdo).sort();

  // Optimization problem display setup
  d3.select("body").selectAll("optpb")
                .data(scenarioKeys)
              .enter()
                .append("div")
                .filter(function(d) { return mdo[d].optpb; })
                  .attr("class", function(d) { return "optpb " + d; })
                  .style("opacity", 0)
                  .on("click", function() {
                    d3.select(this).transition().duration(500)
                      .style("opacity", 0)
                      .style("pointer-events", "none");
                  }).append("pre").text(function(d) { return mdo[d].optpb; });

  var xdsms = {};

  if (scenarioKeys.indexOf('root') === -1) {
    // old format: mono xdsm
    var graph = new Graph(mdo);
    xdsms.root = new Xdsm(graph, 'root', tooltip);
    xdsms.root.draw();
  } else {
    // new format managing several XDSM
    scenarioKeys.forEach(function(k) {
      if (mdo.hasOwnProperty(k)) {
        var graph = new Graph(mdo[k], k);
        xdsms[k] = new Xdsm(graph, k, tooltip);
        xdsms[k].draw();
        xdsms[k].svg.select(".optimization").on("click", function() {
          var info = d3.select(".optpb." + k);
          info.style("opacity", 0.9);
          info.style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
          info.style("pointer-events", "auto");
        });
      }
    }, this);
  }

  var anim = new Animation(xdsms);
  if (xdsms.root.hasWorkflow()) {  // workflow is optional
    var ctrls = new Controls(anim); // eslint-disable-line no-unused-vars
  }
  anim.renderNodeStatuses();

  var addButton = d3.select('button#add');
  addButton.on('click', function() {
    xdsms.root.addNode("Discipline");
  });
  var delButton = d3.select('button#del');
  delButton.on('click', function() {
    xdsms.root.removeNode();
  });
});

