var d3 = require('d3');

var PULSE_DURATION = 700;
var SUB_ANIM_DELAY = 200;
var ACTIVE_COLOR = d3.rgb("seagreen");

function Animation(xdsms, rootId, delay) {
  this.rootId = rootId;
  if (typeof (rootId) === 'undefined') {
    this.rootId = 'root';
  }
  this.root = xdsms[this.rootId];
  this.xdsms = xdsms;
  this.duration = PULSE_DURATION;
  this.initialDelay = delay || 0;
  this.curStep = 0;
}

Animation.prototype._pulse = function(delay, toBeSelected, option) {
  var sel = d3.select("svg." + this.rootId)
              .selectAll(toBeSelected)
              .transition().delay(delay);
  if (option !== "out") {
    sel = sel.transition().duration(200)
            .style('stroke-width', '8px')
            .style('stroke', ACTIVE_COLOR)
            .style('fill', function(d) {
              if (d.id) {
                return ACTIVE_COLOR.brighter();
              }});
  }
  if (option !== "in") {
    sel.transition().duration(3 * PULSE_DURATION)
            .style('stroke-width', null)
            .style('stroke', null)
            .style('fill', null);
  }
};

Animation.prototype._pulse_link = function(delay, fromId, toId) {
  var graph = this.xdsms[this.rootId].graph;
  var from = graph.idxOf(fromId);
  var to = graph.idxOf(toId);
  this._pulse(delay, "polyline.link_" + from + "_" + to);
};

Animation.prototype._on_animation_start = function(delay) {
  var title = d3.select("svg." + this.rootId).select("g.title");
  title.select("text").transition().delay(delay).style("fill", ACTIVE_COLOR);
  d3.select("svg." + this.rootId).select("rect.border")
    .transition().delay(delay)
      .style("stroke-width", '5px').duration(200)
    .transition().duration(1000)
      .style("stroke", 'black').style("stroke-width", '0px');
};

Animation.prototype._on_animation_stop = function(delay) {
  var title = d3.select("svg." + this.rootId).select("g.title");
  title.select("text").transition()
    .delay(delay)
    .style("fill", null);
};

Animation.prototype._is_sub_scenario = function(nodeId) {
  console.log(nodeId);
  var gnode = "g." + nodeId;
  var nodeSel = d3.select("svg." + this.rootId).select(gnode);
  console.log(nodeSel);
  return nodeSel.classed("mdo");
};

Animation.prototype._schedule_animation = function() {
  var self = this;
  var delay = this.initialDelay;
  var animDelay = SUB_ANIM_DELAY;
  var graph = self.xdsms[self.rootId].graph;

  self._on_animation_start(delay);

  graph.nodesByStep.forEach(function(nodesAtStep, n, nodesByStep) {
    var offsets = [];
    nodesAtStep.forEach(function(nodeId) {
      var elapsed = delay + n * PULSE_DURATION;

      if (n > 0) {
        nodesByStep[n-1].forEach(function(prevNodeId) { // eslint-disable-line space-infix-ops
          self._pulse_link(elapsed, prevNodeId, nodeId);
        });

        var gnode = "g." + nodeId;
        var nodeSel = d3.select("svg." + self.rootId).select(gnode);
        if (self._is_sub_scenario(nodeId)) {
          self._pulse(elapsed, gnode + " > rect", "in");
          var scnId = graph.getNode(nodeId).getScenarioId();
          var anim = new Animation(self.xdsms, scnId, elapsed + animDelay);
          var offset = anim._schedule_animation();
          offsets.push(offset);
          self._pulse(offset + elapsed + animDelay, gnode + " > rect", "out");
        } else {
          self._pulse(elapsed, gnode + " > rect");
        }
      }
    }, this);

    if (offsets.length > 0) {
      delay += Math.max.apply(null, offsets);
    }
    delay += animDelay;
  }, this);

  self._on_animation_stop(graph.nodesByStep.length * PULSE_DURATION + delay);

  return graph.nodesByStep.length * PULSE_DURATION;
};

Animation.prototype._reset = function() {
  d3.selectAll('rect').transition().duration(0)
            .style('stroke-width', null)
            .style('stroke', null);
  d3.selectAll('.title > text').transition().duration(0)
            .style('fill', null);

  d3.selectAll('.node > rect').transition().duration(0)
            .style('stroke-width', null)
            .style('stroke', null)
            .style('fill', null);
  d3.selectAll('polyline').transition().duration(0)
            .style('stroke-width', null)
            .style('stroke', null)
            .style('fill', null);
};

Animation.prototype.start = function() {
  this.stop();
  this._schedule_animation();
};

Animation.prototype.stop = function() {
  this._reset();
  this.curStep = 0;
};

Animation.prototype.step_active = function() {
  return this.curStep > 0;
};

Animation.prototype.step = function() {
  var self = this;
  self._reset();
  var graph = self.xdsms[self.rootId].graph;

  console.log("STEP= "+self.curStep);
  if (self.step_active() && graph.nodesByStep[self.curStep].some(self._is_sub_scenario)) {
    console.log("subscenarios !!!");
  } else {
    console.log("NOT subscenarios !!!");
    self.curStep += 1;
    if (self.curStep === graph.nodesByStep.length) {
      self.curStep = 0;
    }

    var nodesAtStep = graph.nodesByStep[self.curStep];
    nodesAtStep.forEach(function(nodeId) {
      graph.nodesByStep[self.curStep-1].forEach(function(prevNodeId) { // eslint-disable-line space-infix-ops
        self._pulse_link(0, prevNodeId, nodeId);
        var gnode = "g." + prevNodeId;
        var nodeSel = d3.select("svg." + self.rootId).select(gnode);
        self._pulse(0, gnode + " > rect", "out");
      });

      var gnode = "g." + nodeId;
      var nodeSel = d3.select("svg." + self.rootId).select(gnode);
      self._pulse(0, gnode + " > rect", "in");
    });
  }
};

module.exports = Animation;
