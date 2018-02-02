var d3 = require('d3');

function Selectable(xdsm, callback) {
  var self = this;
  this._xdsm = xdsm;
  this._selection = null;
  this._prevSelection = null;
  this._callback = callback;

  self._toggleSelection('.node', 'rect');
  self._toggleSelection('.edge', 'polygon');
}

Selectable.prototype._toggleSelection = function(klass, borderElt) {
  var self = this;
  d3.selectAll(klass).on('click', function() {
    self._selection = d3.select(this).select(borderElt); // eslint-disable-line
                                                          // no-invalid-this
    if (self._prevSelection &&
        self._prevSelection.data()[0].id === self._selection.data()[0].id) {
      // unselect if already selected
      self._selection = null;
    }
    self._callback(self.getFilter());
  });
};

Selectable.prototype._select = function(selection) {
  selection.transition().duration(100).style('stroke-width', '4px');
};

Selectable.prototype._unselect = function(selection) {
  selection.transition().duration(100).style('stroke-width', null);
};

Selectable.prototype.getFilter = function() {
  var filter = {
    fr: undefined,
    to: undefined,
  };
  if (this._selection) {
    var selected = this._selection.data()[0];
    if (selected.iotype) { // edge
      filter.fr = this._xdsm.graph.getNodeFromIndex(selected.row).id;
      filter.to = this._xdsm.graph.getNodeFromIndex(selected.col).id;
    } else { // node
      filter.fr = selected.id;
      filter.to = selected.id;
    }
  }
  return filter;
};

Selectable.prototype.setFilter = function(filter) {
  // console.log('selectable.setFilter '+JSON.stringify(filter));
  var self = this;
  if (filter.fr === filter.to) {
    if (filter.fr !== undefined) {
      var node = this._xdsm.graph.getNode(filter.fr);
      self._selection = d3.select(".id"+node.id+" > rect");
      self._select(self._selection);
    }
  } else {
    if (filter.fr !== undefined && filter.to !== undefined) {
      self._selection = d3.select(".idlink_"+filter.fr+"_"+filter.to+" > polygon");
      self._select(self._selection);
    }
  }
  if (self._prevSelection) {
    self._unselect(self._prevSelection);
  }
  self._prevSelection = self._selection;
};

module.exports = Selectable;
