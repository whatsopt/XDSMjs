var UID = "_U_";
var MULTI_TYPE = "_multi";

function Node(id, name, type) {
  if (typeof (name) === 'undefined') {
    type = id;
  }
  if (typeof (type) === 'undefined') {
    type = 'analysis';
  }
  this.id = id;
  this.name = name;
  this.isMulti = (type.search(/_multi$/) >= 0);
  this.type = this.isMulti ?
    type.substr(0, type.length - MULTI_TYPE.length) : type;
}

function Edge(from, to, name, row, col, isMulti) {
  this.id = from + "-" + to;
  this.name = name;
  this.row = row;
  this.col = col;
  this.iotype = row < col ? "in" : "out";
  this.io = {
    fromU: (from === UID),
    toU: (to === UID)
  };
  this.isMulti = isMulti;
}

Edge.prototype.isIO = function() {
  return this.io.fromU || this.io.toU;
};

function Graph(mdo) {
  this.nodes = [new Node(UID, UID, "user")];
  this.edges = [];
  this.chains = [];

  mdo.nodes.forEach(function(item) {
    this.nodes.push(new Node(item.id, item.name, item.type));
  }, this);

  mdo.edges.forEach(function(item) {
    var ids = this.nodes.map(function(elt) {
      return elt.id;
    });
    var idA = ids.indexOf(item.from);
    var idB = ids.indexOf(item.to);
    var isMulti = this.nodes[idA].isMulti || this.nodes[idB].isMulti;
    this.edges.push(new Edge(item.from, item.to, item.name, idA, idB, isMulti));
  }, this);

  mdo.chains.forEach(function(chain, i) {
    if (chain.length < 2) {
      throw new Error("Bad process chain (" + chain.length + "elt)");
    } else {
      this.chains.push([]);
      chain.forEach(function(item, j) {
        if (j !== 0) {
          var ids = this.nodes.map(function(elt) {
            return elt.id;
          });
          var idA = ids.indexOf(chain[j - 1]);
          var idB = ids.indexOf(chain[j]);
          this.chains[i].push([idA, idB]);
        }
      }, this);
    }
  }, this);
}

module.exports = Graph;
