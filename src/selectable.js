var d3 = require('d3');

function Selectable(xdsm) {
  var self = this;
  this._xdsm = xdsm;
  this._selection = null;
  this._prev_selection = null;
  
  d3.selectAll('.node')
  .on('click', function() {
    console.log('*****************************************');
    self._selection = d3.select(this).select('rect');
    console.log(self._selection.data()[0]);
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
    self._prev_selection = self._selection;
  });
  
  d3.selectAll('.edge')
  .on('click', function() {
    console.log('##########################################"');
    self._selection = d3.select(this).select('polygon'); 
    console.log(self._selection.data()[0]);
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
    self._prev_selection = self._selection;
  });
}

Selectable.prototype._select = function(selection) {
  console.log('select '+selection.data().id);
  selection.transition().duration(100).style('stroke-width', '4px');
}
Selectable.prototype._unselect = function(selection) {
  console.log('unselect '+selection.data().id);
  selection.transition().duration(100).style('stroke-width', null);
}

module.exports = Selectable 