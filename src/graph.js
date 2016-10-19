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

function Graph(mdo, refname) {
  this.nodes = [new Node(UID, UID, "user")];
  this.edges = [];
  this.chains = [];
  this.refname = refname || "";

  var numPrefixes = Graph.number(mdo.workflow);

  mdo.nodes.forEach(function(item) {
    this.nodes.push(new Node(item.id,
      numPrefixes[item.id] + ":" + item.name,
      item.type));
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

  var echain = Graph.expand(mdo.workflow);
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
}

function _expand(workflow) {
  var ret = [];
  var prev;
  workflow.forEach(function(item) {
    if (item instanceof Array) {
      if (item[0].hasOwnProperty('parallel')) {
        if (prev) {
          ret = ret.slice(0, ret.length - 1).concat(item[0].parallel.map(
              function(elt) {
                return [prev].concat(_expand([elt]), prev);
              }));
        } else {
          throw new Error("Bad workflow structure : " +
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

Graph.number = function(workflow, num) {
  num = (typeof num === 'undefined') ? 0 : num;
  var toNum = {};

  function setNum(nodeId, num) {
    if (nodeId in toNum) {
      toNum[nodeId] += "," + num;
    } else {
      toNum[nodeId] = String(num);
    }
  }

  function _number(wks, num) {
    var ret = 0;
    if (wks instanceof Array) {
      if (wks.length === 0) {
        ret = num;
      } else if (wks.length === 1) {
        ret = _number(wks[0], num);
      } else {
        var head = wks[0];
        var tail = wks.slice(1);
        var beg = _number(head, num);
        if (tail[0] instanceof Array) {
          var end = _number(tail[0], beg);
          setNum(head, end + "-" + beg);
          beg = end + 1;
          tail.shift();
        }
        ret = _number(tail, beg);
      }
    } else if ((wks instanceof Object) && 'parallel' in wks) {
      var nums = wks.parallel.map(function(branch) {
        return _number(branch, num);
      });
      ret = Math.max.apply(null, nums);
    } else {
      setNum(wks, num);
      ret = num + 1;
    }
    return ret;
  }

  _number(workflow, num);
  return toNum;
};

module.exports = Graph;
