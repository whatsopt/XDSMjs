var test = require('tape');
var Labelizer = require('../src/labelizer');
var Graph = require('../src/graph');

test("Labelizer.strParse('') returns [{'base':'', 'sub':undefined, 'sup':undefined}]", function(t) {
  t.deepEqual(Labelizer.strParse(""), [{'base':'', 'sub':undefined, 'sup':undefined}]);
  t.end();
});
test("Labelizer.strParse('+A') throws an error", function(t) {
  t.throws(function() {Labelizer.strParse("+");}, "should throw an error");
  t.end();
});
test("Labelizer.strParse('x') returns [{'base':'x', 'sub':undefined, 'sup':undefined}]", function(t) {
  t.deepEqual(Labelizer.strParse("x"), [{'base':'x', 'sub':undefined, 'sup':undefined}]);
  t.end();
});
test("Labelizer.strParse('Optimization') returns [{'base':'Optimization', 'sub':undefined, 'sup':undefined}]", function(t) {
  t.deepEqual(Labelizer.strParse("Optimization"), [{'base':'Optimization', 'sub':undefined, 'sup':undefined}]);
  t.end();
});

test("Labelizer.strParse('x_12') returns [{'base':'x', 'sub': '12', 'sup':undefined}]", function(t) {
  t.deepEqual(Labelizer.strParse("x_12"), [{'base':'x', 'sub': '12', 'sup':undefined}]);
  t.end();
});

test("Labelizer.strParse('x_13^{(0)}') returns [{'base':'x', 'sub': '13', 'sup': '{(0)}'}]", function(t) {
  t.deepEqual(Labelizer.strParse("x_13^{(0)}"), [{'base':'x', 'sub': '13', 'sup': '{(0)}'}]);
  t.end();
});
test("Labelizer.strParse('x_13^0, y_1^{*}') returns [{'base':'x', 'sub': '13', 'sup': '{*}'}, \
                                         {'base':'y', 'sub': '1', 'sup': '*'}]", function(t) {
  t.deepEqual(Labelizer.strParse("x_13^{(0)}, y_1^{*}"), [{'base':'x', 'sub': '13', 'sup': '{(0)}'}, 
                                                          {'base':'y', 'sub': '1', 'sup': '{*}'}]);
  t.end();
});
test("Labelizer.strParse('1:Opt') returns [{'base':'1:Opt', 'sub':undefined, 'sup':undefined}]", function(t) {
  t.deepEqual(Labelizer.strParse("1:Opt"), [{'base':'1:Opt', 'sub':undefined, 'sup':undefined}]);
  t.end();
});


test("Graph.flatten(['b2']) returns ['b2']", function(t) {
  t.deepEqual(Graph.flatten(['b2']), ['b2']);
  t.end();
});
test("Graph.flatten('b2') returns 'b2'", function(t) {
  t.deepEqual(Graph.flatten('b2'), 'b2');
  t.end();
});
test("Graph.expand(['a']) returns ['a']", function(t) {
  t.deepEqual(Graph.expand(['a']), ['a']);
  t.end();
});
test("Graph.expand([['a']]) returns ['a']", function(t) {
  t.deepEqual(Graph.expand([['a']]), ['a']);
  t.end();
});
test("Graph.expand(['a', 'b']) returns ['a', 'b']", function(t) {
  t.deepEqual(Graph.expand(['a', 'b']), ['a', 'b']);
  t.end();
});
test("Graph.expand([['a', 'b']]) returns ['a', 'b']", function(t) {
  t.deepEqual(Graph.expand([['a', 'b']]), ['a', 'b']);
  t.end();
});
test("Graph.expand(['a', ['b']]) returns ['a', 'b', 'a']", function(t) {
  t.deepEqual(Graph.expand(['a', ['b']]), ['a', 'b', 'a']);
  t.end();
});
test("Graph.expand([['a'], 'b']) returns ['a', 'b']", function(t) {
  t.deepEqual(Graph.expand([['a'], 'b']), ['a', 'b']);
  t.end();
});
test("Graph.expand([['a'], 'b', 'c']) returns ['a', 'b', 'c']", function(t) {
  t.deepEqual(Graph.expand([['a'], 'b', 'c']), ['a', 'b', 'c']);
  t.end();
});
test("Graph.expand(['a', ['b'], 'c']) returns ['a', 'b', 'a', 'c']", function(t) {
  t.deepEqual(Graph.expand(['a', ['b'], 'c']), ['a', 'b', 'a', 'c']);
  t.end();
});
test("Graph.expand(['a', [['b']], 'c']) returns ['a', 'b', 'a', 'c']", function(t) {
  t.deepEqual(Graph.expand(['a', [['b']], 'c']), ['a', 'b', 'a', 'c']);
  t.end();
});
test("Graph.expand(['a', [['b', [d]]], 'c']) returns ['a', 'b', 'd', 'b', 'a', 'c']", function(t) {
  t.deepEqual(Graph.expand(['a', [['b', ['d']]], 'c']), ['a', 'b', 'd', 'b', 'a', 'c']);
  t.end();
});
test("Graph.expand(['a', ['b1', 'b2'], 'c']) returns ['a', 'b1', 'b2', 'a', 'c']", function(t) {
  t.deepEqual(Graph.expand(['a', ['b1', 'b2'], 'c']), ['a', 'b1', 'b2', 'a', 'c']);
  t.end();
});
test("Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']) returns ['a0', 'b1', 'b2', 'b3', 'a0', 'c3']", function(t) {
  t.deepEqual(Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']), ['a0', 'b1', 'b2', 'b3', 'a0', 'c3']);
  t.end();
});
test("Graph.expand(['Opt', ['MDA', ['DA1', 'DA2', 'DA3'],'Func']]) returns ['Opt', 'MDA', 'DA1', 'DA2', 'DA3', 'MDA','Func', 'Opt']", function(t) {
  t.deepEqual(Graph.expand(['Opt', ['MDA', ['DA1', 'DA2', 'DA3'],'Func']]), 
                           ['Opt', 'MDA', 'DA1', 'DA2', 'DA3', 'MDA','Func', 'Opt']);
  t.end();
});
test("Graph.expand([['Opt', 'DA1'], ['Opt', 'DA2'], ['Opt', 'DA3']]) returns ['Opt', 'DA1', 'Opt', 'DA2',  'Opt', 'DA3']", function(t) {
	t.deepEqual(Graph.expand([['Opt', 'DA1'], ['Opt', 'DA2'], ['Opt', 'DA3']]),
  	                       ['Opt', 'DA1', 'Opt', 'DA2',  'Opt', 'Opt', 'DA3']);
  t.end();
});
test("Graph.chains should expand as list of index couples", function(t) {
  g = new Graph({nodes:[{id:'Opt',name:'Opt'},
                        {id:'MDA',name:'MDA'},
                        {id:'DA1',name:'DA1'},
                        {id:'DA2',name:'DA2'},
                        {id:'DA3',name:'DA3'},
                        {id:'Func',name:'Func'}], 
                 edges:[], chains:[['Opt', ['MDA', ['DA1', 'DA2', 'DA3'],'Func']]]});
  t.deepEqual(g.chains, [[[1,2], [2,3], [3,4], [4,5], [5,2], [2,6], [6,1]]]);
  t.end();
});
test("Graph.chains should expand as list of index couples", function(t) {
  g = new Graph({nodes:[{id:'Opt',name:'Opt'},
                        {id:'DA1',name:'DA1'},
                        {id:'DA2',name:'DA2'},
                        {id:'DA3',name:'DA3'},
                        {id:'Func',name:'Func'}],
                        edges:[], chains:[['Opt', ['DA1'], 'Opt', ['DA2'], 'Opt', ['DA3'], 'Func']]});
  t.deepEqual(g.chains, [[[1,2], [2,1], [1,3], [3,1], [1,4], [4,1], [1,5]]]);
  t.end();
});
