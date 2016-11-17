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

Animation.prototype._pulse = function(delay, to_be_selected, option) {
  var sel = d3.select("svg."+this.rootId).select(to_be_selected).transition().delay(delay);
  if (option !== "out") {
    sel = sel.transition().style('stroke-width', '8px').duration(200);
  }
  if (option !== "in") {
    sel.transition().style('stroke-width', '1px').duration(3*PULSE_DURATION);
  }
};


Animation.prototype._animate = function() {
  var self = this;
  var graph = self.xdsms[self.rootId].graph;
  var n = 0;
  var prev;

  for (var k in graph.nodesByStep) {
    var offsets = [];
    graph.nodesByStep[k].forEach(function(nodeId) {
      if (n > 0) {
        prev.forEach(function(prevNodeId) {
          var from = graph.idxOf(prevNodeId);
          var to = graph.idxOf(nodeId);
          self._pulse(self.delay+n*PULSE_DURATION,"polyline.link_"+from+"_"+to);
        });

        var nodeSel = d3.select("svg."+self.rootId).select("g."+nodeId);
        if (nodeSel.classed("mdo")) {
          self._pulse(self.delay+n*PULSE_DURATION, "g."+nodeId+" > rect", "in");
          var scnId = graph.getNode(nodeId).getScenarioId();
          var anim = new Animation(self.xdsms, scnId, self.delay+n*PULSE_DURATION);
          var offset = anim._animate();
          offsets.push(offset);
          self._pulse(self.delay+n*PULSE_DURATION+offset, "g."+nodeId+" > rect", "out");
        } else {
          self._pulse(self.delay+n*PULSE_DURATION, "g."+nodeId+" > rect");
        }
      }
    }, this);

    if (offsets.length > 0) {
      self.delay += Math.max.apply(null, offsets);
    }

    prev = graph.nodesByStep[k];
    n = n+1;
  };

  return graph.nodesByStep.length*PULSE_DURATION;
};

Animation.prototype.run = function() {
  this._animate();
};

module.exports = Animation;
