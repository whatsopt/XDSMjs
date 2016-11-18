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
test("Labelizer.strParse('1:L-BFGS-B') returns [{'base':'1:L-BFGS-B', 'sub':undefined, 'sup':undefined}]", function(t) {
  t.deepEqual(Labelizer.strParse("1:L-BFGS-B"), [{'base':'1:L-BFGS-B', 'sub':undefined, 'sup':undefined}]);
  t.end();
});
test("Labelizer.strParse('y_12_y_23') returns [{'base':'1:L-BFGS-B', 'sub':undefined, 'sup':undefined}]", function(t) {
  t.deepEqual(Labelizer.strParse("1:L-BFGS-B"), [{'base':'1:L-BFGS-B', 'sub':undefined, 'sup':undefined}]);
  t.end();
});

test("Graph.expand(['a']) returns [['a']]", function(t) {
  t.deepEqual(Graph.expand(['a']), [['a']]);
  t.end();
});
test("Graph.expand([['a']]) returns [['a']]", function(t) {
  t.deepEqual(Graph.expand([['a']]), [['a']]);
  t.end();
});
test("Graph.expand(['a', 'b']) returns [['a', 'b']]", function(t) {
  t.deepEqual(Graph.expand(['a', 'b']), [['a', 'b']]);
  t.end();
});
test("Graph.expand([['a', 'b']]) returns [['a', 'b']]", function(t) {
  t.deepEqual(Graph.expand([['a', 'b']]), [['a', 'b']]);
  t.end();
});
test("Graph.expand(['a', ['b']]) returns [['a', 'b', 'a']]", function(t) {
  t.deepEqual(Graph.expand(['a', ['b']]), [['a', 'b', 'a']]);
  t.end();
});
test("Graph.expand([['a'], 'b']) returns ['a', 'b']", function(t) {
  t.deepEqual(Graph.expand([['a'], 'b']), [['a', 'b']]);
  t.end();
});
test("Graph.expand([['a'], 'b', 'c']) returns ['a', 'b', 'c']", function(t) {
  t.deepEqual(Graph.expand([['a'], 'b', 'c']), [['a', 'b', 'c']]);
  t.end();
});
test("Graph.expand(['a', ['b'], 'c']) returns [['a', 'b', 'a', 'c']]", function(t) {
  t.deepEqual(Graph.expand(['a', ['b'], 'c']), [['a', 'b', 'a', 'c']]);
  t.end();
});
test("Graph.expand(['a', [['b']], 'c']) returns [['a', 'b', 'a', 'c']]", function(t) {
  t.deepEqual(Graph.expand(['a', [['b']], 'c']), [['a', 'b', 'a', 'c']]);
  t.end();
});
test("Graph.expand(['a', [['b', [d]]], 'c']) returns [['a', 'b', 'd', 'b', 'a', 'c']]", function(t) {
  t.deepEqual(Graph.expand(['a', [['b', ['d']]], 'c']), [['a', 'b', 'd', 'b', 'a', 'c']]);
  t.end();
});
test("Graph.expand(['a', ['b1', 'b2'], 'c']) returns [['a', 'b1', 'b2', 'a', 'c']]", function(t) {
  t.deepEqual(Graph.expand(['a', ['b1', 'b2'], 'c']), [['a', 'b1', 'b2', 'a', 'c']]);
  t.end();
});
test("Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']) returns [['a0', 'b1', 'b2', 'b3', 'a0', 'c3']]", function(t) {
  t.deepEqual(Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']), [['a0', 'b1', 'b2', 'b3', 'a0', 'c3']]);
  t.end();
});
test("Graph.expand(['opt', ['mda', ['d1', 'd2', 'd3'],'func']]) returns [['opt', 'mda', 'd1', 'd2', 'd3', 'mda','func', 'opt']]", function(t) {
  t.deepEqual(Graph.expand(['opt', ['mda', ['d1', 'd2', 'd3'],'func']]),
                           [['opt', 'mda', 'd1', 'd2', 'd3', 'mda','func', 'opt']]);
  t.end();
});
test("Graph.expand([{parallel: ['d1', 'd2']}]) returns [[d1], [d2]]", function(t) {
  t.deepEqual(Graph.expand([{parallel: ['d1', 'd2']}]),
                           [['d1'], ['d2']]);
  t.end();
});
test("Graph.expand([{parallel: ['d1', 'd2']}]) returns [[d1], [d2]]", function(t) {
  t.deepEqual(Graph.expand([{parallel: ['d1', 'd2']}]),
                           [['d1'], ['d2']]);
  t.end();
});
test("Graph.expand(['opt', {parallel: ['d1', 'd2', 'd3']}]) returns [['opt', 'd1'], ['opt', 'd2'], ['opt', 'd3']]", function(t) {
  t.deepEqual(Graph.expand(['opt', {parallel: ['d1', 'd2', 'd3']}]),
                           [['opt', 'd1'], ['opt', 'd2'], ['opt', 'd3']]);
  t.end();
});
test("Graph.expand(['opt', [{parallel: ['d1', 'd2', 'd3']}]]) returns [['opt', 'd1', 'opt'], ['opt', 'd2', 'opt'], ['opt', 'd3', 'opt']]", function(t) {
  t.deepEqual(Graph.expand(['opt', [{parallel: ['d1', 'd2', 'd3']}]]),
                           [['opt', 'd1', 'opt'], ['opt', 'd2', 'opt'], ['opt', 'd3', 'opt']]);
  t.end();
});
test("Graph.expand(['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']) returns [['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]", function(t) {
  t.deepEqual(Graph.expand(['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']),
                           [['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]);
  t.end();
});
test("Graph.expand(['opt', 'mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]) returns [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]", function(t) {
  t.deepEqual(Graph.expand(['opt', 'mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']),
                           [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]);
  t.end();
});
test("Graph.expand(['opt', ['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]) returns [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt']]", function(t) {
  t.deepEqual(Graph.expand(['opt', ['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]),
              [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt']]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]]) returns [['_U_', 'opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt', '_U_']]", function(t) {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]]),
                           [['_U_', 'opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt', '_U_']]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", function(t) {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', ['d1', 'd2']]]]),
      [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]);
t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2'], 'mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", function(t) {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', ['d1', 'd2'], 'mda', ['d1', 'd2']]]]),
      [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]);
t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2'], {parallel: ['sc1', 'sc2']},'mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda'], ['mda', 'sc1', 'mda'], ['mda', 'sc2', 'mda'], ['mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", function(t) {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', ['d1', 'd2'], {parallel: ['sc1', 'sc2']}, 'mda', ['d1', 'd2']]]]),
      [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda'], ['mda', 'sc1', 'mda'], ['mda', 'sc2', 'mda'], ['mda', 'd1', 'd2', 'mda', 'opt', '_U_']]);
t.end();
});
test("Graph.chains should expand as list of index couples", function(t) {
  g = new Graph({nodes:[{id:'Opt',name:'Opt'},
                        {id:'MDA',name:'MDA'},
                        {id:'DA1',name:'DA1'},
                        {id:'DA2',name:'DA2'},
                        {id:'DA3',name:'DA3'},
                        {id:'Func',name:'Func'}],
                 edges:[], workflow:['Opt', ['MDA', ['DA1', 'DA2', 'DA3'],'Func']]});
  t.deepEqual(g.chains, [[[1,2], [2,3], [3,4], [4,5], [5,2], [2,6], [6,1]]]);
  t.end();
});
test("Graph.chains should expand as list of index couples", function(t) {
  g = new Graph({nodes:[{id:'Opt',name:'Opt'},
                        {id:'DA1',name:'DA1'},
                        {id:'DA2',name:'DA2'},
                        {id:'DA3',name:'DA3'},
                        {id:'Func',name:'Func'}],
                        edges:[], workflow:[['Opt', ['DA1'], 'Opt', ['DA2'], 'Opt', ['DA3'], 'Func']]});
  t.deepEqual(g.chains, [[[1,2], [2,1], [1,3], [3,1], [1,4], [4,1], [1,5]]]);
  t.end();
});


test("Graph.number(['d1']) returns {'toNum':{d1: '0'}, 'toNodes':[['d1']])", function(t) {
  t.deepEqual(Graph.number(['d1']), {'toNum':{d1: '0'},
                                     'toNode':[['d1']]});
  t.equal(Graph.number(['d1']).toNode.length, 1);
  t.end();
});
test("Graph.number(['d1', 'd1']) returns {'toNum':{d1: '0,1'}, 'toNodes':[['d1'],['d1']]})", function(t) {
  t.deepEqual(Graph.number(['d1', 'd1']), {'toNum':{d1: '0,1'},
                                           'toNode':[['d1'],['d1']]});
  t.end();
});
test("Graph.number(['mda', 'd1']) returns {'toNum':{mda:'0', d1: '1'}, 'toNode':[['mda'], ['d1']]})", function(t) {
  t.deepEqual(Graph.number(['mda', 'd1']), {'toNum':{mda:'0', d1: '1'},
                                            'toNode':[['mda'], ['d1']]});
  t.end();
});
test("Graph.number(['mda', 'd1', 'd2', 'd3']) returns {mda: '0', d1: '1', d2: '2', d3: '3'})", function(t) {
  t.deepEqual(Graph.number(['mda', 'd1', 'd2', 'd3']).toNum, {mda: '0', d1: '1', d2: '2', d3: '3'});
  t.end();
});
test("Graph.number(['mda', ['d1', 'd2', 'd3']]) returns {mda: '0,4-1', d1: '1', d2: '2', d3: '3'} )", function(t) {
  t.deepEqual(Graph.number(['mda', ['d1', 'd2', 'd3']]).toNum, {mda: '0,4-1', d1: '1', d2: '2', d3: '3'});
  t.end();
});
test("Graph.number(['mda', {parallel:['d1', 'd2', 'd3']}]) returns {'mda': '0', 'd1': '1', 'd2': '1', 'd3': '1'})", function(t) {
  t.deepEqual(Graph.number(['mda', {parallel:['d1', 'd2', 'd3']}]).toNum, {'mda': '0', 'd1': '1', 'd2': '1', 'd3': '1'});
  t.end();
});
test("Graph.number(['mda', [{parallel:['d1', 'd2', 'd3']}]]) returns {'toNum':{'mda': '0,2-1', 'd1': '1', 'd2': '1', 'd3': '1'}, 'toNode':[['mda'], ['d1','d2','d3']]})", function(t) {
  t.deepEqual(Graph.number(['mda', [{parallel:['d1', 'd2', 'd3']}]]).toNum, {'mda': '0,2-1', 'd1': '1', 'd2': '1', 'd3': '1'});
  t.deepEqual(Graph.number(['mda', [{parallel:['d1', 'd2', 'd3']}]]).toNode, [['mda'], ['d1','d2','d3'], ['mda']]);
  t.end();
});
test("Graph.number(['opt', 'mda', ['d1', 'd2', 'd3']]) returns {'opt': '0', 'mda': '1,5-2', 'd1': '2', 'd2': '3', 'd3': '4'})", function(t) {
  t.deepEqual(Graph.number(['opt', 'mda', ['d1', 'd2', 'd3']]).toNum, {'opt': '0', 'mda': '1,5-2', 'd1': '2', 'd2': '3', 'd3': '4'});
  t.end();
});
test("Graph.number([['opt', ['mda', ['d1', 'd2', 'd3']]], 'd4']) returns {'opt': '0,6-1', 'mda': '1,5-2', 'd1': '2', 'd2': '3', 'd3': '4', 'd4': '7'})", function(t) {
  t.deepEqual(Graph.number([['opt', ['mda', ['d1', 'd2', 'd3']]], 'd4']).toNum, {'opt': '0,6-1', 'mda': '1,5-2', 'd1': '2', 'd2': '3', 'd3': '4', 'd4': '7'});
  t.end();
});
test("Graph.number([['Opt', ['mda', ['d1'], 's1']]]) returns {'Opt': '0,5-1', 'mda': '1,3-2', 'd1': '2', 's1': '4'})", function(t) {
  t.deepEqual(Graph.number([['Opt', ['mda', ['d1'], 's1']]]).toNum, {'Opt': '0,5-1', 'mda': '1,3-2', 'd1': '2', 's1': '4'});
  t.end();
});

