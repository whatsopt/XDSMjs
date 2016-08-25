function Labelizer() {}

Labelizer.strParse = function(str) {
  if (str === "") { return [{base: '', sub: undefined, sup: undefined}];}
  
  var lstr = str.split(',');
  var rg = /([A-Za-z0-9]+)(_[A-Za-z0-9]+)?(\^.+)?/;

  var res = lstr.map(function(s) {
    var base;
    var sub;
    var sup;
    var m = s.match(rg);
    if (m) {
      base = m[1];
      if (m[2]) {
        sub = m[2].substring(1);
      }
      if (m[3]) {
        sup = m[3].substring(1);
      }
    } else {
      console.log("Warning : can not parse " + s);
      throw "LabelizeError";
    }
    return {base: base, sub: sub, sup: sup};
  }, this);

  return res;
};


Labelizer.labelize = function() {
  var ellipsis = 0;
  
  function createLabel(selection) {
    selection.each(function(d) {
      var tokens = Labelizer.strParse(d.name);
      var text = selection.append("text");
      tokens.every(function(token, i, ary) {
        if (ellipsis < 1 || i < 5) {
          text.append("tspan").text(token.base);
          var offsetSub = 0;
          var offsetSup = 0;
          var newElts = [];
          if (token.sub) {
            offsetSub = 10;
            text.append("tspan")
              .attr("class", "sub")
              .attr("dy", offsetSub)
              .text(token.sub);
          }
          if (token.sup) {
            offsetSup = -10;
            text.append("tspan")
              .attr("class", "sup")
              .attr("dx", -5)
              .attr("dy", -offsetSub + offsetSup)
              .text(token.sup);
            offsetSub = 0;
          }
        } else {
          text.append("tspan")
            .attr("dy", -offsetSub - offsetSup)
            .text("...");
          return false;
        }
        if (i < ary.length - 1) {
          text.append("tspan")
            .attr("dy", -offsetSub - offsetSup)
            .text(", ");
        }
        return true;
      }, this);
    });
  }
  
  createLabel.ellipsis = function(value) {
    if (!arguments.length) return ellipsis;
    ellipsis = value;
    return createLabel;
  }
  
  return createLabel;
};

module.exports = Labelizer;
