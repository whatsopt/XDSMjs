var test = require('tape');
var strParse = require('../src/string_processor');

test("strParse('x') returns {'base':'x', 'sub':undefined, 'sup':undefined}", function(t) {
  t.deepEqual(strParse("x"), {'base':'x', 'sub':undefined, 'sup':undefined});
  t.end();
});

test("strParse('x_12') returns {'base':'x', 'sub': '12', 'sup':undefined}", function(t) {
  t.deepEqual(strParse("x_12"), {'base':'x', 'sub': '12', 'sup':undefined});
  t.end();
});

test("strParse('x_13^0') returns {'base':'x', 'sub': '13', 'sup': '0'}", function(t) {
  t.deepEqual(strParse("x_13^0"), {'base':'x', 'sub': '13', 'sup': '0'});
  t.end();
});