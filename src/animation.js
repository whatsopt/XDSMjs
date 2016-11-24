var d3 = require('d3');

var PULSE_DURATION = 700;
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

Animation.prototype._animate = function() {
  var self = this;
  var delay = this.initialDelay;
  var graph = self.xdsms[self.rootId].graph;

  var title = d3.select("svg." + self.rootId).select("g.title");
  title.select("text").transition().delay(delay).style("fill", ACTIVE_COLOR);
  d3.select("svg." + self.rootId).select("rect.border")
    .transition().delay(delay)
      .style("stroke-width", '3px').duration(500)
    .transition().duration(1000)
      .style("stroke", 'black').style("stroke-width", '0px');

  graph.nodesByStep.forEach(function(nodesAtStep, n, nodesByStep) {
    var offsets = [];
    var animDelay = 0;
    nodesAtStep.forEach(function(nodeId) {
      var elapsed = delay + n * PULSE_DURATION;

      if (n > 0) {
        nodesByStep[n-1].forEach(function(prevNodeId) { // eslint-disable-line space-infix-ops
          var from = graph.idxOf(prevNodeId);
          var to = graph.idxOf(nodeId);
          self._pulse(elapsed,
                      "polyline.link_" + from + "_" + to);
        });

        var gnode = "g." + nodeId;
        var nodeSel = d3.select("svg." + self.rootId).select(gnode);
        if (nodeSel.classed("mdo")) {
          self._pulse(elapsed, gnode + " > rect", "in");
          var scnId = graph.getNode(nodeId).getScenarioId();
          // add small 200ms latency for best animation sequence
          animDelay += 2000;
          var anim = new Animation(self.xdsms, scnId, elapsed + animDelay);
          var offset = anim._animate();
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

  title.select("text").transition()
    .delay(graph.nodesByStep.length * PULSE_DURATION + delay)
    .style("fill", null);

  return graph.nodesByStep.length * PULSE_DURATION;
};

Animation.prototype.run = function() {
  this._animate();
};

module.exports = Animation;
