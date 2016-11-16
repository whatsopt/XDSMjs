var d3 = require('d3');

var PULSE_DURATION = 2000;

function Animation(xdsms, rootId) {
  this.rootId = rootId;
  if (typeof (rootId) === 'undefined') {
    this.rootId = 'root';
  }
  this.root = xdsms[this.rootId];
  this.xdsms = xdsms;
  this.duration = PULSE_DURATION;
}

Animation.prototype._pulse2 = function(to_be_selected, transition) {
  //console.log("svg."+this.rootId+" -> "+to_be_selected);
  var t0 = transition.transition();
  t0.select("svg."+this.rootId).select(to_be_selected).style('stroke-width', '8px').duration(200);
  var t1 = t0.transition();
  t1.select("svg."+this.rootId).select(to_be_selected).style('stroke-width', '1px').duration(PULSE_DURATION-200);
  return t1;
};

Animation.prototype._animate = function(trans) {
  var self = this;
  var n = 0;
  var prev;
  var graph = self.xdsms[self.rootId].graph;

  var transition = trans;
  if (typeof(transition) === 'undefined') {
    transition = d3.transition();
  }

  for (var k in graph.nodesByStep) {
    var transStep = transition;
    graph.nodesByStep[k].forEach(function(nodeId) {
      if (n > 0) {
        prev.forEach(function(prevNodeId) {
          var from = graph.idxOf(prevNodeId);
          var to = graph.idxOf(nodeId);
          self._pulse2("polyline.link_"+from+"_"+to, transStep);
        });
      }

      transition = self._pulse2("g."+nodeId+" > rect", transStep);

      var nodeSel = d3.select("svg."+this.rootId).select("g."+nodeId);
      if (nodeSel.classed("mdo")) {
        var scnId = graph.getNode(nodeId).getScenarioId();
        var anim = new Animation(self.xdsms, scnId);
        transition = anim._animate(transStep);
      }
    }, this);

    prev = graph.nodesByStep[k];
    n = n+1;
  };

  return transition;
};

Animation.prototype.run = function() {
  this._animate();
};

module.exports = Animation;
