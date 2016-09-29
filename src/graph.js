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
    var echain = Graph.expand(chain);
    echain.forEach(function(leaf_chain, k) {
      if (leaf_chain.length < 2) {
        throw new Error("Bad process chain (" + leaf_chain.length + "elt)");
      } else {
        this.chains.push([]);
        var ids = this.nodes.map(function(elt) {
          return elt.id;
        });
        leaf_chain.forEach(function(item, j) {
          if (j !== 0) {
            var idA = ids.indexOf(leaf_chain[j - 1]);
            if (idA < 0) {
              throw new Error("Process chain element (" +
                              leaf_chain[j - 1] + ") not found");
            }
            var idB = ids.indexOf(leaf_chain[j]);
            if (idB < 0) {
              throw new Error("Process chain element (" +
                              leaf_chain[j] + ") not found");
            }
            if (idA !== idB) {
              this.chains[this.chains.length-1].push([idA, idB]);
            }
          }
        }, this);
      }
    }, this);
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

function _expand(item, level, head) {
  if (level === undefined) {
    level = 0;
  }
  console.log("expand("+JSON.stringify(item)+", "+level+", "+JSON.stringify(head)+")");
  if (item instanceof Array) {
    var ret = [];
    if (item.length === 0) {
      return ret;
    } else if (item.length === 1) {
      if (item[0].hasOwnProperty('parallel')) {
        ret = item[0].parallel.map(function(elt) { return [_expand(elt, level+1, head)]; });
        if (head !== undefined) {
          ret = ret.map(function(elt) { return [head].concat(elt); });
        }
      } else if (item[0] instanceof Array) {
        ret = _expand(item[0], level+1, head);
        if (head !== undefined) {
          if (ret instanceof Array && ret[0] instanceof Array) {
            ret = ret.map(function(elt) { return [].concat(elt, head); });
          } else {
            if (head !== ret[ret.length-1]) {
              ret = [].concat(ret, head);
            }
          }
        } else {
          ret = [].concat(ret);
        }  
      } else {
        ret = _expand(item[0], level+1);
      }
      console.log("return ret = "+JSON.stringify(ret));
      return ret;
    }
    var car = item.shift();
    var ecar = [_expand(car, level + 1, head)];
    var cadr = item.shift();
    var cdr  = item;
    if (cadr instanceof Array) {   
      var ecadr = _expand([cadr], level + 1, ecar[ecar.length-1]);
      ecdr = _expand(cdr, level + 1, ecar[ecar.length-1]);
      if (cadr[0] instanceof Object && cadr[0].hasOwnProperty('parallel')) {
        return [].concat(ecar.slice(0, ecar.length-1), ecadr, ecdr);
      } else {
        return [].concat(ecar, ecadr, ecdr);
      } 
    } 
    if (cadr.hasOwnProperty('parallel')) {
      console.log("coucou "+ JSON.stringify(cadr));
      return [].concat(ecar.slice(0, ecar.length-1), _expand([].concat(cadr, cdr), level + 1, ecar[0]));
    }
    return [].concat(ecar, _expand([].concat(cadr, cdr), level + 1));
  }
  
  //console.log("not array return "+item);
  return item;
};

Graph.expand = function(item, level) {
  var expanded = _expand(item, level);
  if (expanded[0] instanceof Array) {
    return expanded;
  } 
  return [expanded];
};

module.exports = Graph;
