var d3 = require('d3');

function Selectable(xdsm, callback) {
  var self = this;
  this._xdsm = xdsm;
  this._selection = null;
  this._prev_selection = null;
  this._callback = callback;

  self._toggleSelection('.node', 'rect');
  self._toggleSelection('.edge', 'polygon');
}

Selectable.prototype._toggleSelection = function(klass, border_elt) {
  var self = this;
  d3.selectAll(klass)
    .on('click', function() {
      self._selection = d3.select(this).select(border_elt); 
      if (self._prev_selection) { 
        if (self._selection.data()[0].id !== self._prev_selection.data()[0].id) {
          self._select(self._selection);
          self._unselect(self._prev_selection);
        } else {
          self._unselect(self._prev_selection);
          self._selection = null;
        }
      } else {
        self._select(self._selection);
      }
      self._callback(self._getFilter());
      self._prev_selection = self._selection;
    });  	
} 

Selectable.prototype._select = function(selection) {
  selection.transition().duration(100).style('stroke-width', '4px');
}

Selectable.prototype._unselect = function(selection) {
  selection.transition().duration(100).style('stroke-width', null);
}

Selectable.prototype._getFilter = function() {
  var filter = { fr: undefined, to: undefined };
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
}

module.exports = Selectable 