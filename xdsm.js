/*
 * XDSMjs
 * Copyright 2016 Rémi Lafage
 */
"use strict";

var d3 = require('d3');
var Graph = require('./src/graph.js');

var WIDTH = 1000;
var HEIGHT = 500;
var X_ORIG = 150;
var Y_ORIG = 20;
var PADDING = 20;
var CELL_W = 250;
var CELL_H = 75;
var MULTI_OFFSET = 3;

function Cell(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

d3.json("xdsm.json", function(error, mdo) {
  if (error) {
    throw error;
  }
  var graph = new Graph(mdo);
  xdsm(graph);
});

function xdsm(graph) {
  var svg = d3.select(".xdsm").append("svg")
              .attr("width", WIDTH)
              .attr("height", HEIGHT)
              .attr("id", "main");
  var grid = [];

  // kind: node || edge
  function createTextGroup(kind) {
    return svg.selectAll("." + kind)
            .data(graph[kind + "s"])
          .enter().append("g")
          .attr("class", function(d) {
            var klass = kind === "node" ? d.type : "dataInter";
            if (klass === "dataInter" && d.isIO()) {
              klass = "dataIO";
            }
            return kind + " " + klass;
          })
          .each(function() {
            var that = d3.select(this);
            that.append("text").text(function(d) {
              return d.name;
            }).attr("class", "plaintext");
          });
  }

  var nodes = createTextGroup("node");
  var edges = createTextGroup("edge");

  // Workflow
  svg.selectAll(".workflow")
    .data(graph.chains)
  .enter().insert("g", ":first-child")
    .attr("class", "workflow")
    .selectAll("polyline")
    .data(function(d) {
      return d;
    })
  .enter().insert("polyline", ":first-child")
    .attr("points", function(d) {
      var i1 = d[0] < d[1] ? d[1] : d[0];
      var i2 = d[0] < d[1] ? d[0] : d[1];
      var w = CELL_W * (i1 - i2);
      var h = CELL_H * (i1 - i2);
      var points = [];
      if (d[0] < d[1]) {
        if (d[0] !== 0) {
          points.push((-w) + ",0");
        }
        points.push("0,0");
        if (d[1] !== 0) {
          points.push("0," + h);
        }
      } else {
        if (d[0] !== 0) {
          points.push(w + ",0");
        }
        points.push("0,0");
        if (d[1] !== 0) {
          points.push("0," + (-h));
        }
      }
      return points.join(" ");
    })
    .attr("transform", function(d) {
      var i1 = d[0] < d[1] ? d[1] : d[0];
      var i2 = d[0] < d[1] ? d[0] : d[1];
      var w;
      var h;
      if (d[0] < d[1]) {
        w = CELL_W * i1 + X_ORIG;
        h = CELL_H * i2 + Y_ORIG;
      } else {
        w = CELL_W * i2 + X_ORIG;
        h = CELL_H * i1 + Y_ORIG;
      }
      return "translate(" + (X_ORIG + w) + "," + (Y_ORIG + h) + ")";
    });

  function layoutText(items) {
    items.each(function(d, i) {
      var item = d3.select(this);
      if (grid[i] === undefined) {
        grid[i] = new Array(items.length);
      }
      item.select("text").each(function(d, j) {
        var that = d3.select(this);
        var data = item.data()[0];
        var m = (data.row === undefined) ? i : data.row;
        var n = (data.col === undefined) ? i : data.col;
        grid[m][n] = new Cell(-that[0][j].getBBox().width / 2,
                              that[0][j].getBBox().height / 3,
                              that[0][j].getBBox().width,
                              that[0][j].getBBox().height);
        that.attr("x", function() {
          return grid[m][n].x;
        }).attr("y", function() {
          return grid[m][n].y;
        }).attr("width", function() {
          return grid[m][n].width;
        }).attr("height", function() {
          return grid[m][n].height;
        });
      });
    });

    items.attr("transform", function(d, i) {
      var m = (d.col === undefined) ? i : d.col;
      var n = (d.row === undefined) ? i : d.row;
      var w = CELL_W * m + X_ORIG;
      var h = CELL_H * n + Y_ORIG;
      return "translate(" + (X_ORIG + w) + "," + (Y_ORIG + h) + ")";
    });
  }

  // layout text
  layoutText(nodes);
  layoutText(edges);

  // rectangles for nodes
  function customRect(node, d, i, offset) {
    node.insert("rect", ":first-child").attr("x", function() {
      return grid[i][i].x + offset - PADDING;
    })
    .attr("y", function() {
      return -Math.abs(grid[i][i].y) - PADDING - offset;
    })
    .attr("width", function() {
      return grid[i][i].width + (PADDING * 2);
    })
    .attr("height", function() {
      return grid[i][i].height + (PADDING * 2);
    })
    .attr("rx", function() {
      var rounded = d.type === 'optimization' ||
                    d.type === 'mda' || d.type === 'doe';
      return rounded ? (grid[i][i].height + (PADDING * 2)) / 2 : 0;
    })
    .attr("ry", function() {
      var rounded = d.type === 'optimization' || d.type === 'mda' ||
                    d.type === 'doe';
      return rounded ? (grid[i][i].height + (PADDING * 2)) / 2 : 0;
    });
  }

  nodes.each(function(d, i) {
    var that = d3.select(this);
    that.call(customRect, d, i, 0);
    if (d.isMulti) {
      that.call(customRect, d, i, 1 * Number(MULTI_OFFSET));
      that.call(customRect, d, i, 2 * Number(MULTI_OFFSET));
    }
  });

  // trapezium for edges
  function customTrapz(edge, d, i, offset) {
    edge.insert("polygon", ":first-child").attr("points", function(d) {
      var pad = 10;
      var w = grid[d.row][d.col].width;
      var h = grid[d.row][d.col].height;
      var topleft = (-2 * pad + 5 - w / 2 + offset) + ", " + (-h - offset);
      var topright = (5 + w / 2 + pad + offset) + ", " + (-h - offset);
      var botright = (w / 2 + pad + offset) + ", " + (pad + h / 2 - offset);
      var botleft = (-2 * pad - w / 2 + offset) + ", " + (pad + h / 2 - offset);
      var tpz = [topleft, topright, botright, botleft].join(" ");
      return tpz;
    });
  }

  edges.each(function(d, i) {
    var that = d3.select(this);
    that.call(customTrapz, d, i, 0);
    if (d.isMulti) {
      that.call(customTrapz, d, i, 1 * Number(MULTI_OFFSET));
      that.call(customTrapz, d, i, 2 * Number(MULTI_OFFSET));
    }
  });

  // Dataflow
  var dataflow = svg.insert("g", ":first-child").attr("class", "dataflow");

  edges.each(function(d, i) {
    dataflow.insert("polyline", ":first-child").attr("points", function() {
      var i1 = (d.iotype === "in") ? d.col : d.row;
      var i2 = (d.iotype === "in") ? d.row : d.col;
      var w = CELL_W * (i1 - i2);
      var h = CELL_H * (i1 - i2);
      var points = [];
      if (d.iotype === "in") {
        if (!d.io.fromU) {
          points.push((-w) + ",0");
        }
        points.push("0,0");
        if (!d.io.toU) {
          points.push("0," + h);
        }
      } else {
        if (!d.io.fromU) {
          points.push(w + ",0");
        }
        points.push("0,0");
        if (!d.io.toU) {
          points.push("0," + (-h));
        }
      }
      return points.join(" ");
    }).attr("transform", function() {
      var m = (d.col === undefined) ? i : d.col;
      var n = (d.row === undefined) ? i : d.row;
      var w = CELL_W * m + X_ORIG;
      var h = CELL_H * n + Y_ORIG;
      return "translate(" + (X_ORIG + w) + "," + (Y_ORIG + h) + ")";
    });
  });

  // set svg size
  var w = CELL_W * (graph.nodes.length + 1);
  var h = CELL_H * (graph.nodes.length + 1);
  svg.attr("width", w).attr("height", h);

  d3.select("button").on("click", function() {
    computedStyleToInlineStyle(svg[0][0], true);

    var html = d3.select("svg").attr("title", "xdsm")
                  .attr("version", 1.1)
                  .attr("xmlns", "http://www.w3.org/2000/svg")
                  .node().parentNode.innerHTML;

    var imgsrc = "data:image/svg+xml;base64," +
                  btoa(unescape(encodeURIComponent(html)));
    var canvas = d3.select("canvas").attr("width", w).attr("height", h);
    var context = canvas[0][0].getContext("2d");

    var image = new Image();
    image.src = imgsrc;
    image.onload = function() {
      context.drawImage(image, 0, 0);
      var canvasdata = canvas[0][0].toDataURL("image/png");
      var pngimg = '<img src="' + canvasdata + '">';
      d3.select("#pngdataurl").html(pngimg);
      var a = document.createElement("a");
      a.download = "xdsm.png";
      a.href = canvasdata;
      document.body.appendChild(a);
      a.click();
    };
  });
}

// this function adds inline style attribute to elements from css styles
// It si required to generate proper image from d3 svg element.
function computedStyleToInlineStyle(element, recursive) {
  if (!element) {
    throw new Error("No element specified.");
  }

  if (!(element instanceof Element)) {
    throw new Error("Specified element is not an instance of Element.");
  }

  if (recursive) {
    Array.prototype.forEach.call(element.children, function(child) {
      computedStyleToInlineStyle(child, recursive);
    });
  }

  var computedStyle = getComputedStyle(element, null);
  for (var i = 0; i < computedStyle.length; i++) {
    var property = computedStyle.item(i);
    // process only the properties used in the css
    if (property === "fill" || property === "stroke" ||
        property === "stroke-width" || property === "visibility") {
      var value = computedStyle.getPropertyValue(property);
      element.style[property] = value;
    }
  }
}

