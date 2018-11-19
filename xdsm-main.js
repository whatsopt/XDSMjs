/*
 * XDSMjs
 * Copyright 2016-2018 Rémi Lafage
 */
"use strict";

import {json} from 'd3-fetch';
import {select, event} from 'd3-selection';
import Graph from './src/graph';
import Xdsm from './src/xdsm';
import Animation from './src/animation';
import Controls from './src/controls';

json("xdsm.json").then(function(mdo) {
  let config = {
    labelizer: {
      ellipsis: 5,
      subSupScript: true,
      showLinkNbOnly: false,
    },
  };

  var scenarioKeys = Object.keys(mdo).sort();

  // Optimization problem display setup
  select("body").selectAll("optpb").data(scenarioKeys).enter().append("div")
      .filter(function(d) {
        return mdo[d].optpb;
      }).attr("class", function(d) {
        return "optpb " + d;
      }).style("opacity", 0).on("click", function() {
        select(this).transition().duration(500) // eslint-disable-line
        // no-invalid-this
        .style("opacity", 0).style("pointer-events", "none");
      }).append("pre").text(function(d) {
        return mdo[d].optpb;
      });

  var xdsms = {};

  if (scenarioKeys.indexOf('root') === -1) {
    // old format: mono xdsm
    var graph = new Graph(mdo);
    xdsms.root = new Xdsm(graph, 'root', config);
    xdsms.root.draw();
  } else {
    // new format managing several XDSM
    scenarioKeys.forEach(function(k) {
      if (mdo.hasOwnProperty(k)) {
        var graph = new Graph(mdo[k], k);
        xdsms[k] = new Xdsm(graph, k, config);
        xdsms[k].draw();
        xdsms[k].svg.select(".optimization").on(
            "click",
            function() {
              var info = select(".optpb." + k);
              info.style("opacity", 0.9);
              info.style("left", (event.pageX) + "px").style("top",
                  (event.pageY - 28) + "px");
              info.style("pointer-events", "auto");
            });
      }
    }, this); // eslint-disable-line no-invalid-this
  }

  var anim = new Animation(xdsms);
  if (xdsms.root.hasWorkflow()) { // workflow is optional
    var ctrls = new Controls(anim); // eslint-disable-line no-unused-vars
  }
  anim.renderNodeStatuses();

  var addButton = select('button#add');
  addButton.on('click', function() {
    xdsms.root.addNode("Discipline");
  });
  var delButton = select('button#del');
  delButton.on('click', function() {
    xdsms.root.removeNode();
  });
});
