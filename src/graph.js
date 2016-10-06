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

  var num_prefixes = {};
  mdo.chains.forEach(function(chain) {
    num_prefixes = Graph.number(chain);
  });

  mdo.nodes.forEach(function(item) {
    this.nodes.push(new Node(item.id, num_prefixes[item.id]+":"+item.name, item.type));
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

  mdo.chains.forEach(function(chain) {
    var echain = Graph.expand(chain);
    echain.forEach(function(leafChain) {
      if (leafChain.length < 2) {
        throw new Error("Bad process chain (" + leafChain.length + "elt)");
      } else {
        this.chains.push([]);
        var ids = this.nodes.map(function(elt) {
          return elt.id;
        });
        leafChain.forEach(function(item, j) {
          if (j !== 0) {
            var idA = ids.indexOf(leafChain[j - 1]);
            if (idA < 0) {
              throw new Error("Process chain element (" +
                              leafChain[j - 1] + ") not found");
            }
            var idB = ids.indexOf(leafChain[j]);
            if (idB < 0) {
              throw new Error("Process chain element (" +
                              leafChain[j] + ") not found");
            }
            if (idA !== idB) {
              this.chains[this.chains.length - 1].push([idA, idB]);
            }
          }
        }, this);
      }
    }, this);
  }, this);
}

function _expand(chain) {
  var ret = [];
  var prev;
  chain.forEach(function(item) {
    if (item instanceof Array) {
      if (item[0].hasOwnProperty('parallel')) {
        if (prev) {
          ret = ret.slice(0, ret.length - 1).concat(item[0].parallel.map(
              function(elt) {
                return [prev].concat(_expand([elt]), prev);
              }));
        } else {
          throw new Error("Bad chain structure : " +
              "cannot parallel loop without previous starting point.");
        }
      } else if (prev) {
        ret = ret.concat(_expand(item), prev);
      } else {
        ret = ret.concat(_expand(item));
      }
      prev = ret[ret.length - 1];
    } else if (item.hasOwnProperty('parallel')) {
      if (prev) {
        ret = ret.slice(0, ret.length - 1).concat(
            item.parallel.map(function(elt) {
              return [prev].concat(_expand([elt]));
            }));
      } else {
        ret = ret.concat(item.parallel.map(
            function(elt) {
              return _expand([elt]);
            }));
      }
      prev = undefined;
    } else {
      var i = ret.length - 1;
      var flagParallel = false;
      while (i >= 0 && (ret[i] instanceof Array)) {
        ret[i] = ret[i].concat(item);
        i -= 1;
        flagParallel = true;
      }
      if (!flagParallel) {
        ret.push(item);
      }
      prev = item;
    }
  }, this);
  return ret;
}

Graph.expand = function(item) {
  var expanded = _expand(item);
  var result = [];
  var current = [];
  expanded.forEach(function(elt) {
    if (elt instanceof Array) {
      if (current.length > 0) {
        current.push(elt[0]);
        result.push(current);
        current = [];
      }
      result.push(elt);
    } else {
      if (result.length > 0 && current.length === 0) {
        var lastChain = result[result.length - 1];
        var lastElt = lastChain[lastChain.length - 1];
        current.push(lastElt);
      }
      current.push(elt);
    }
  }, this);
  if (current.length > 0) {
    result.push(current);
  }
  return result;
};


Graph.number = function(wk_struct, num) {
  num = typeof num !== 'undefined' ? num : 0;
  to_num = {};
  
  function set_num(node_id, num) {
    if (node_id in to_num) {
      to_num[node_id] += "," + num;
    } else {
      to_num[node_id] = "" + num;
    }
  }
  
  function _number(wks, num) {
    if (wks instanceof Array) {
      if (wks.length === 0) {
        return num;
      } else if (wks.length === 1) {
        return _number(wks[0], num);
      } else {
        var head = wks[0];
        var tail = wks.slice(1);
        var beg = _number(head, num);
        var end;
        if (tail[0] instanceof Array) {
          end = _number(tail[0], beg);
          set_num(head, end + "-" + beg);
          beg = end + 1;
          tail.shift();
        } 
        end = _number(tail, beg);
        return end;
      }
    } else if ((wks instanceof Object) && 'parallel' in wks) {
      var nums = wks.parallel.map(function (branch) { return _number(branch, num); });
      end = Math.max.apply(null, nums);
      return end;
    } else {
      set_num(wks, num);
      return num + 1;
    }
  }

  _number(wk_struct, num);
  return to_num;
};

module.exports = Graph;
