var d3 = require('d3');

function Animation(xdsms) {
  this.root = xdsms['root'];
  this.xdsms = xdsms;
}

Animation.prototype._pulse = function(delay, shape) {
  shape.transition().style('stroke-width', '8px').delay(delay).duration(200)
    .transition().style('stroke-width', '1px').delay(200).duration(500);
};

Animation.prototype._animate = function() {
  var self = this;
  var n = 0;
  var prev;
  for (k in this.root.graph.nodesByStep) {
    self.root.graph.nodesByStep[k].forEach(function(nodeId) {
      if (n > 0) {
        prev.forEach(function(prevNodeId) {
          var from = self.root.graph.idxOf(prevNodeId);
          var to = self.root.graph.idxOf(nodeId);
          self._pulse(n*700, d3.select("polyline.link_"+from+"_"+to));
        });
      }
      var node = d3.select("g."+nodeId);
      if (node.classed("mdo")) {
        console.log("hey scenar!");
      }
      self._pulse(n*700, node.select("rect"));
    }, this);
    prev = self.root.graph.nodesByStep[k];
    n = n+1;
  };
};

Animation.prototype.run = function() {
  this._animate();
};

module.exports = Animation;
