var test = require('tape');
var strParse = require('../src/string_processor');
var Graph = require('../src/graph');

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
test("Graph.expand(['a', 'b']) returns ['a', 'b', 'a']", function(t) {
  t.deepEqual(Graph.expand(['a', 'b']), ['a', 'b', 'a']);
  t.end();
});
test("Graph.expand([['a', 'b']]) returns ['a', 'b', 'a']", function(t) {
  t.deepEqual(Graph.expand([['a', 'b']]), ['a', 'b', 'a']);
  t.end();
});
test("Graph.expand(['a', ['b']]) returns ['a', 'b', 'a']", function(t) {
  t.deepEqual(Graph.expand(['a', ['b']]), ['a', 'b', 'a']);
  t.end();
});
test("Graph.expand([['a'], 'b']) returns ['a', 'b', 'a']", function(t) {
  t.deepEqual(Graph.expand([['a'], 'b']), ['a', 'b', 'a']);
  t.end();
});
test("Graph.expand([['a'], 'b', 'c']) returns ['a', 'b', 'c', 'a']", function(t) {
  t.deepEqual(Graph.expand([['a'], 'b', 'c']), ['a', 'b', 'c', 'a']);
  t.end();
});
test("Graph.expand(['a', ['b'], 'c']) returns ['a', 'b', 'c', 'a']", function(t) {
  t.deepEqual(Graph.expand(['a', ['b'], 'c']), ['a', 'b', 'c', 'a']);
  t.end();
});
test("Graph.expand(['a', [['b']], 'c']) returns ['a', 'b', 'c', 'a']", function(t) {
  t.deepEqual(Graph.expand(['a', [['b']], 'c']), ['a', 'b', 'c', 'a']);
  t.end();
});
test("Graph.expand(['a', [['b', [d]]], 'c']) returns ['a', 'b', 'd', 'b', 'c', 'a']", function(t) {
  t.deepEqual(Graph.expand(['a', [['b', ['d']]], 'c']), ['a', 'b', 'd', 'b', 'c', 'a']);
  t.end();
});
test("Graph.expand(['a', ['b1', 'b2'], 'c']) returns ['a', 'b1', 'b2', 'b1', 'c', 'a']", function(t) {
  t.deepEqual(Graph.expand(['a', ['b1', 'b2'], 'c']), ['a', 'b1', 'b2', 'b1', 'c', 'a']);
  t.end();
});
test("Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']) returns ['a0', 'b1', 'b2', 'b3', 'b1', 'c3', 'a0']", function(t) {
  t.deepEqual(Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']), ['a0', 'b1', 'b2', 'b3', 'b1', 'c3', 'a0']);
  t.end();
});
test("Graph.expand(['Opt', ['MDA', 'DA1', 'DA2', 'DA3'],'Func']) returns ['Opt', 'MDA', 'DA1', 'DA2', 'DA3', 'MDA','Func', 'Opt']", function(t) {
  t.deepEqual(Graph.expand(['Opt', ['MDA', 'DA1', 'DA2', 'DA3'],'Func']), 
                           ['Opt', 'MDA', 'DA1', 'DA2', 'DA3', 'MDA','Func', 'Opt']);
  t.end();
});
test("Graph.expand([['Opt', 'DA1'], ['Opt', 'DA2'], ['Opt', 'DA3']]) returns ['Opt', 'DA1', 'Opt', 'DA2',  'Opt', 'DA3', 'Opt']", function(t) {
	t.deepEqual(Graph.expand([['Opt', 'DA1'], ['Opt', 'DA2'], ['Opt', 'DA3']]),
  	                       ['Opt', 'DA1', 'Opt', 'Opt', 'DA2',  'Opt', 'Opt', 'DA3', 'Opt', 'Opt']);
  t.end();
});
test("Graph.chains should expand as list of index couples", function(t) {
  g = new Graph({nodes:[{id:'Opt',name:'Opt'},
                        {id:'MDA',name:'MDA'},
                        {id:'DA1',name:'DA1'},
                        {id:'DA2',name:'DA2'},
                        {id:'DA3',name:'DA3'},
                        {id:'Func',name:'Func'}], 
                 edges:[], chains:[['Opt', ['MDA', 'DA1', 'DA2', 'DA3'],'Func']]});
  t.deepEqual(g.chains, [[[1,2], [2,3], [3,4], [4,5], [5,2], [2,6], [6,1]]]);
  t.end();
});
test("Graph.chains should expand as list of index couples", function(t) {
	  g = new Graph({nodes:[{id:'Opt',name:'Opt'},
	                        {id:'DA1',name:'DA1'},
	                        {id:'DA2',name:'DA2'},
	                        {id:'DA3',name:'DA3'},
	                        {id:'Func',name:'Func'}],
	                 edges:[], chains:[['Opt', 'DA1'], ['Opt', 'DA2'], ['Opt', 'DA3'],'Func']]});
	  t.deepEqual(g.chains, [[[1,2], [2,1] [1,3], [3,1], [1,4], [4,1], [1,6], [6,1]]]);
	  t.end();
	}); 
