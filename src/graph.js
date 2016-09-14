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
    chain = Graph.expand(chain);
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
          if (idA < 0) {
            throw new Error("Process chain element (" +
                            chain[j - 1] + ") not found");
          }
          var idB = ids.indexOf(chain[j]);
          if (idB < 0) {
            throw new Error("Process chain element (" +
                            chain[j] + ") not found");
          }
          if (idA !== idB) {
            this.chains[i].push([idA, idB]);
          }
        }
      }, this);
    }
  }, this);
}

var flatten = Graph.flatten = function _flatten(a, r) {
  if (!r) {
    r = [];
  }
  if (a instanceof Array) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] instanceof Array) {
        _flatten(a[i], r);
      } else {
        r.push(a[i]);
      }
    }
  } else {
    return a;
  }
  return r;
};

function _expand(item, level) {
  if (level === undefined) {
    level = 0;
  }
  //console.log("expand("+item+", "+level+")");
  if (item instanceof Array) {
    if (item.length === 0) {
      return [];
    } else if (item.length === 1) {
      var my = [flatten(_expand(item[0], level+1))];
      //console.log("return my = "+my);
      return my;
    }
    var car = item.shift();
    var ecar = flatten([_expand(car, level + 1)]);
    var cadr = item.shift();
    var ecadr = flatten([_expand(cadr, level + 1)]);
    var cdr = _expand(item, level + 1);
    var ret;
    if (cadr instanceof Array) {
      //console.log("return ecar="+ecar+", ecadr="+ecadr+", ecar[0]="+ecar[0]+", cdr="+cdr );
      ret = [].concat(ecar, ecadr, ecar[0], cdr);
    } else {
      ret = [].concat(ecar, ecadr, cdr);
    }
    //console.log("return "+ret);
    return ret;
  }
  
  console.log("not array return "+item);
  return item;
};

Graph.expand = function(item, level) {
  return flatten(_expand(item, level));
};

module.exports = Graph;
