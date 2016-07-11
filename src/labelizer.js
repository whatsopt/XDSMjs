function Labelizer() {}

Labelizer.strParse = function(str) {
  var rg = /([A-Za-z0-9]+)(_[A-Za-z0-9]+)?(\^[A-Za-z0-9]+)?/;
  var base;
  var sub;
  var sup;
  var m = str.match(rg);
  if (m) {
    base = m[1];
    if (m[2]) {
      sub = m[2].substring(1);
    }
    if (m[3]) {
      sup = m[3].substring(1);
    }
  }
  return {base: base, sub: sub, sup: sup};
}

Labelizer.labelize = function() {
  function createLabel(selection) {
    selection.each(function(data) {
      var text = selection.append("text").text(function(d) {
               return d.name;
             });
    });
  }
  
  return createLabel;
}


//module.exports.strParse = strParse;
//module.exports.labelize = labelize;

module.exports = Labelizer;