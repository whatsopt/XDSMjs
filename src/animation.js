var d3 = require('d3');

var PULSE_DURATION = 700;

function Animation(xdsms, rootId, delay) {
  this.rootId = rootId;
  if (typeof (rootId) === 'undefined') {
    this.rootId = 'root';
  }
  this.root = xdsms[this.rootId];
  this.xdsms = xdsms;
  this.duration = PULSE_DURATION;
  this.delay = delay || 0;
}

Animation.prototype._pulse = function(delay, toBeSelected, option) {
  var sel = d3.select("svg." + this.rootId)
              .select(toBeSelected)
              .transition().delay(delay);
  var color = d3.rgb('black');
  if (d3.select(".optimization").node()) { // try to use darkened optim node color
    color = d3.rgb(d3.select(".optimization").style("fill")).darker();
  }
  if (option !== "out") {
    sel = sel.transition().duration(200)
            .style('stroke-width', '8px')
            .style('stroke', color);
  }
  if (option !== "in") {
    sel.transition().duration(3 * PULSE_DURATION)
            .style('stroke-width', '1px')
            .style('stroke', 'black');
  }
};

Animation.prototype._animate = function() {
  var self = this;
  var graph = self.xdsms[self.rootId].graph;

  graph.nodesByStep.forEach(function(nodesAtStep, n, nodesByStep) {
    var offsets = [];
    nodesAtStep.forEach(function(nodeId) {
      var elapsed = n * PULSE_DURATION;

      if (n > 0) {
        nodesByStep[n-1].forEach(function(prevNodeId) { // eslint-disable-line space-infix-ops
          var from = graph.idxOf(prevNodeId);
          var to = graph.idxOf(nodeId);
          self._pulse(self.delay + elapsed,
                      "polyline.link_" + from + "_" + to);
        });

        var gnode = "g." + nodeId;
        var nodeSel = d3.select("svg." + self.rootId).select(gnode);
        if (nodeSel.classed("mdo")) {
          self._pulse(self.delay + elapsed, gnode + " > rect", "in");
          var scnId = graph.getNode(nodeId).getScenarioId();
          var anim = new Animation(self.xdsms, scnId, self.delay + elapsed);
          var offset = anim._animate();
          offsets.push(offset);
          self._pulse(self.delay + offset + elapsed, gnode + " > rect", "out");
        } else {
          self._pulse(self.delay + elapsed, gnode + " > rect");
        }
      }
    }, this);

    if (offsets.length > 0) {
      self.delay += Math.max.apply(null, offsets);
    }
  }, this);

  return graph.nodesByStep.length * PULSE_DURATION;
};

Animation.prototype.run = function() {
  this._animate();
};

module.exports = Animation;
