import Labelizer from '../src/labelizer';
import Graph from '../src/graph';
import XdsmFactory from '../src/xdsm-factory';

const test = require('tape');

test("Labelizer.strParse('') returns [{'base':'', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse(''), [{ base: '', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('+A') throws an error", (t) => {
  t.throws(() => { Labelizer.strParse('+'); }, 'should throw an error');
  t.end();
});
test("Labelizer.strParse('ConvCheck') returns [{'base':'ConvCheck', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('ConvCheck'), [{ base: 'ConvCheck', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('x') returns [{'base':'x', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('x'), [{ base: 'x', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('&#x03BB') returns [{'base':'&#x03BB', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('&#x03BB'), [{ base: '&#x03BB', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('&#x03BB_&#x03BB^&#x03BB') "
  + "returns [{'base':'&#x03BB', 'sub':'&#x03BB', 'sup':'&#x03BB'}]", (t) => {
    t.deepEqual(Labelizer.strParse('&#x03BB_&#x03BB^&#x03BB'),
      [{ base: '&#x03BB', sub: '&#x03BB', sup: '&#x03BB' }]);
    t.end();
  });
test("Labelizer.strParse('Optimization') "
  + "returns [{'base':'Optimization', 'sub':undefined, 'sup':undefined}]", (t) => {
    t.deepEqual(Labelizer.strParse('Optimization'), [{ base: 'Optimization', sub: undefined, sup: undefined }]);
    t.end();
  });

test("Labelizer.strParse('x_12') returns [{'base':'x', 'sub': '12', 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_12'), [{ base: 'x', sub: '12', sup: undefined }]);
  t.end();
});

test("Labelizer.strParse('x_13^{(0)}') returns [{'base':'x', 'sub': '13', 'sup': '{(0)}'}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_13^{(0)}'), [{ base: 'x', sub: '13', sup: '{(0)}' }]);
  t.end();
});
test("Labelizer.strParse('x_13^0, y_1^{*}') returns [{'base': 'x', 'sub': '13', 'sup': '{*}'}, "
  + "{'base':'y', 'sub': '1', 'sup': '*'}]", (t) => {
    t.deepEqual(Labelizer.strParse('x_13^{(0)}, y_1^{*}'), [{ base: 'x', sub: '13', sup: '{(0)}' },
    { base: 'y', sub: '1', sup: '{*}' }]);
    t.end();
  });
test("Labelizer.strParse('1:Opt') returns [{'base':'1:Opt', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('1:Opt'), [{ base: '1:Opt', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('1:L-BFGS-B') returns [{'base':'1:L-BFGS-B', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('1:L-BFGS-B'), [{ base: '1:L-BFGS-B', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('y_12_y_34') returns [{'base':'y_12_y_34', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('y_12_y_34'), [{ base: 'y_12_y_34', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('y_12_y_34^*') returns [{'base':'y_12_y_34', 'sub':undefined, 'sup':'*'}]", (t) => {
  t.deepEqual(Labelizer.strParse('y_12_y_34^*'), [{ base: 'y_12_y_34', sub: undefined, sup: '*' }]);
  t.end();
});
test("Graph.expand(['a']) returns [['a']]", (t) => {
  t.deepEqual(Graph.expand(['a']), [['a']]);
  t.end();
});
test("Graph.expand([['a']]) returns [['a']]", (t) => {
  t.deepEqual(Graph.expand([['a']]), [['a']]);
  t.end();
});
test("Graph.expand(['a', 'b']) returns [['a', 'b']]", (t) => {
  t.deepEqual(Graph.expand(['a', 'b']), [['a', 'b']]);
  t.end();
});
test("Graph.expand([['a', 'b']]) returns [['a', 'b']]", (t) => {
  t.deepEqual(Graph.expand([['a', 'b']]), [['a', 'b']]);
  t.end();
});
test("Graph.expand(['a', ['b']]) returns [['a', 'b', 'a']]", (t) => {
  t.deepEqual(Graph.expand(['a', ['b']]), [['a', 'b', 'a']]);
  t.end();
});
test("Graph.expand([['a'], 'b']) returns ['a', 'b']", (t) => {
  t.deepEqual(Graph.expand([['a'], 'b']), [['a', 'b']]);
  t.end();
});
test("Graph.expand([['a'], 'b', 'c']) returns ['a', 'b', 'c']", (t) => {
  t.deepEqual(Graph.expand([['a'], 'b', 'c']), [['a', 'b', 'c']]);
  t.end();
});
test("Graph.expand(['a', ['b'], 'c']) returns [['a', 'b', 'a', 'c']]", (t) => {
  t.deepEqual(Graph.expand(['a', ['b'], 'c']), [['a', 'b', 'a', 'c']]);
  t.end();
});
test("Graph.expand(['a', [['b']], 'c']) returns [['a', 'b', 'a', 'c']]", (t) => {
  t.deepEqual(Graph.expand(['a', [['b']], 'c']), [['a', 'b', 'a', 'c']]);
  t.end();
});
test("Graph.expand(['a', [['b', [d]]], 'c']) returns [['a', 'b', 'd', 'b', 'a', 'c']]", (t) => {
  t.deepEqual(Graph.expand(['a', [['b', ['d']]], 'c']), [['a', 'b', 'd', 'b', 'a', 'c']]);
  t.end();
});
test("Graph.expand(['a', ['b1', 'b2'], 'c']) returns [['a', 'b1', 'b2', 'a', 'c']]", (t) => {
  t.deepEqual(Graph.expand(['a', ['b1', 'b2'], 'c']), [['a', 'b1', 'b2', 'a', 'c']]);
  t.end();
});
test("Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']) returns [['a0', 'b1', 'b2', 'b3', 'a0', 'c3']]", (t) => {
  t.deepEqual(Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']), [['a0', 'b1', 'b2', 'b3', 'a0', 'c3']]);
  t.end();
});
test("Graph.expand(['opt', ['mda', ['d1', 'd2', 'd3'],'func']]) returns [['opt', 'mda', 'd1', 'd2', 'd3', 'mda','func', 'opt']]", (t) => {
  t.deepEqual(Graph.expand(['opt', ['mda', ['d1', 'd2', 'd3'], 'func']]),
    [['opt', 'mda', 'd1', 'd2', 'd3', 'mda', 'func', 'opt']]);
  t.end();
});
test("Graph.expand([{parallel: ['d1', 'd2']}]) returns [[d1], [d2]]", (t) => {
  t.deepEqual(Graph.expand([{ parallel: ['d1', 'd2'] }]),
    [['d1'], ['d2']]);
  t.end();
});
test("Graph.expand([{parallel: ['d1', 'd2']}]) returns [[d1], [d2]]", (t) => {
  t.deepEqual(Graph.expand([{ parallel: ['d1', 'd2'] }]),
    [['d1'], ['d2']]);
  t.end();
});
test("Graph.expand(['opt', {parallel: ['d1', 'd2', 'd3']}]) returns [['opt', 'd1'], ['opt', 'd2'], ['opt', 'd3']]", (t) => {
  t.deepEqual(Graph.expand(['opt', { parallel: ['d1', 'd2', 'd3'] }]),
    [['opt', 'd1'], ['opt', 'd2'], ['opt', 'd3']]);
  t.end();
});
test("Graph.expand(['opt', [{parallel: ['d1', 'd2', 'd3']}]]) returns [['opt', 'd1', 'opt'], ['opt', 'd2', 'opt'], ['opt', 'd3', 'opt']]", (t) => {
  t.deepEqual(Graph.expand(['opt', [{ parallel: ['d1', 'd2', 'd3'] }]]),
    [['opt', 'd1', 'opt'], ['opt', 'd2', 'opt'], ['opt', 'd3', 'opt']]);
  t.end();
});
test("Graph.expand(['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']) returns [['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]", (t) => {
  t.deepEqual(Graph.expand(['mda', { parallel: ['d1', 'd2', 'd3'] }, 'd4']),
    [['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]);
  t.end();
});
test("Graph.expand(['opt', 'mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]) returns [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]", (t) => {
  t.deepEqual(Graph.expand(['opt', 'mda', { parallel: ['d1', 'd2', 'd3'] }, 'd4']),
    [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]);
  t.end();
});
test("Graph.expand(['opt', ['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]) returns [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt']]", (t) => {
  t.deepEqual(Graph.expand(['opt', ['mda', { parallel: ['d1', 'd2', 'd3'] }, 'd4']]),
    [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt']]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]]) returns [['_U_', 'opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt', '_U_']]", (t) => {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', { parallel: ['d1', 'd2', 'd3'] }, 'd4']]]),
    [['_U_', 'opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt', '_U_']]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", (t) => {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', ['d1', 'd2']]]]),
    [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2'], 'mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", (t) => {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', ['d1', 'd2'], 'mda', ['d1', 'd2']]]]),
    [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2'], {parallel: ['sc1', 'sc2']},'mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda'], ['mda', 'sc1', 'mda'], ['mda', 'sc2', 'mda'], ['mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", (t) => {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', ['d1', 'd2'], { parallel: ['sc1', 'sc2'] }, 'mda', ['d1', 'd2']]]]),
    [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda'], ['mda', 'sc1', 'mda'], ['mda', 'sc2', 'mda'], ['mda', 'd1', 'd2', 'mda', 'opt', '_U_']]);
  t.end();
});
test("Graph.expand((['d1', {parallel: ['sc1', 'sc2']}, 'd2']) returns [['d1', 'sc1', 'd2'], ['d1', 'sc2', 'd2']]", (t) => {
  t.deepEqual(Graph.expand(['d1', { parallel: ['sc1', 'sc2'] }, 'd2']), [['d1', 'sc1', 'd2'], ['d1', 'sc2', 'd2']]);
  t.end();
});
test("Graph.expand((['opt', ['d1', {parallel: ['sc1', 'sc2']}]]) returns [['opt', 'd1'] ['d1', 'sc1', 'opt'], ['d1', 'sc2', 'opt']]", (t) => {
  t.deepEqual(Graph.expand(['opt', ['d1', { parallel: ['sc1', 'sc2'] }]]), [['opt', 'd1'], ['d1', 'sc1', 'opt'], ['d1', 'sc2', 'opt'], ['opt', 'opt']]);
  t.end();
});
test('Graph.chains should expand as list of index couples', (t) => {
  const g = new Graph({
    nodes: [{ id: 'Opt', name: 'Opt' },
    { id: 'MDA', name: 'MDA' },
    { id: 'DA1', name: 'DA1' },
    { id: 'DA2', name: 'DA2' },
    { id: 'DA3', name: 'DA3' },
    { id: 'Func', name: 'Func' }],
    edges: [],
    workflow: ['Opt', ['MDA', ['DA1', 'DA2', 'DA3'], 'Func']],
  });
  t.deepEqual(g.chains, [[[1, 2], [2, 3], [3, 4], [4, 5], [5, 2], [2, 6], [6, 1]]]);
  t.end();
});
test('Graph.chains should expand as list of index couples', (t) => {
  const g = new Graph({
    nodes: [{ id: 'Opt', name: 'Opt' },
    { id: 'DA1', name: 'DA1' },
    { id: 'DA2', name: 'DA2' },
    { id: 'DA3', name: 'DA3' },
    { id: 'Func', name: 'Func' }],
    edges: [],
    workflow: [['Opt', ['DA1'], 'Opt', ['DA2'], 'Opt', ['DA3'], 'Func']],
  });
  t.deepEqual(g.chains, [[[1, 2], [2, 1], [1, 3], [3, 1], [1, 4], [4, 1], [1, 5]]]);
  t.end();
});
test("Graph.number(['d1']) returns {'toNum':{d1: '0'}, 'toNodes':[['d1']])", (t) => {
  t.deepEqual(Graph.number(['d1']), {
    toNum: { d1: '0' },
    toNode: [['d1']],
  });
  t.equal(Graph.number(['d1']).toNode.length, 1);
  t.end();
});
test("Graph.number(['d1', 'd1']) returns {'toNum':{d1: '0,1'}, 'toNodes':[['d1'],['d1']]})", (t) => {
  t.deepEqual(Graph.number(['d1', 'd1']), {
    toNum: { d1: '0,1' },
    toNode: [['d1'], ['d1']],
  });
  t.end();
});
test("Graph.number(['mda', 'd1']) returns {'toNum':{mda:'0', d1: '1'}, 'toNode':[['mda'], ['d1']]})", (t) => {
  t.deepEqual(Graph.number(['mda', 'd1']), {
    toNum: { mda: '0', d1: '1' },
    toNode: [['mda'], ['d1']],
  });
  t.end();
});
test("Graph.number(['mda', 'd1', 'd2', 'd3']) returns {mda: '0', d1: '1', d2: '2', d3: '3'})", (t) => {
  t.deepEqual(Graph.number(['mda', 'd1', 'd2', 'd3']).toNum, {
    mda: '0', d1: '1', d2: '2', d3: '3',
  });
  t.end();
});
test("Graph.number(['mda', ['d1', 'd2', 'd3']]) returns {mda: '0,4-1', d1: '1', d2: '2', d3: '3'} )", (t) => {
  t.deepEqual(Graph.number(['mda', ['d1', 'd2', 'd3']]).toNum, {
    mda: '0,4-1', d1: '1', d2: '2', d3: '3',
  });
  t.end();
});
test("Graph.number(['mda', {parallel:['d1', 'd2', 'd3']}]) returns {'mda': '0', 'd1': '1', 'd2': '1', 'd3': '1'})", (t) => {
  t.deepEqual(Graph.number(['mda', { parallel: ['d1', 'd2', 'd3'] }]).toNum, {
    mda: '0', d1: '1', d2: '1', d3: '1',
  });
  t.end();
});
test("Graph.number(['mda', [{parallel:['d1', 'd2', 'd3']}]]) returns {'toNum':{'mda': '0,2-1', 'd1': '1', 'd2': '1', 'd3': '1'}, 'toNode':[['mda'], ['d1','d2','d3']]})", (t) => {
  t.deepEqual(Graph.number(['mda', [{ parallel: ['d1', 'd2', 'd3'] }]]).toNum, {
    mda: '0,2-1', d1: '1', d2: '1', d3: '1',
  });
  t.deepEqual(Graph.number(['mda', [{ parallel: ['d1', 'd2', 'd3'] }]]).toNode, [['mda'], ['d1', 'd2', 'd3'], ['mda']]);
  t.end();
});
test("Graph.number(['opt', 'mda', ['d1', 'd2', 'd3']]) returns {'opt': '0', 'mda': '1,5-2', 'd1': '2', 'd2': '3', 'd3': '4'})", (t) => {
  t.deepEqual(Graph.number(['opt', 'mda', ['d1', 'd2', 'd3']]).toNum, {
    opt: '0', mda: '1,5-2', d1: '2', d2: '3', d3: '4',
  });
  t.end();
});
test("Graph.number([['opt', ['mda', ['d1', 'd2', 'd3']]], 'd4']) returns {'opt': '0,6-1', 'mda': '1,5-2', 'd1': '2', 'd2': '3', 'd3': '4', 'd4': '7'})", (t) => {
  t.deepEqual(Graph.number([['opt', ['mda', ['d1', 'd2', 'd3']]], 'd4']).toNum, {
    opt: '0,6-1', mda: '1,5-2', d1: '2', d2: '3', d3: '4', d4: '7',
  });
  t.end();
});
test("Graph.number([['Opt', ['mda', ['d1'], 's1']]]) returns {'Opt': '0,5-1', 'mda': '1,3-2', 'd1': '2', 's1': '4'})", (t) => {
  t.deepEqual(Graph.number([['Opt', ['mda', ['d1'], 's1']]]).toNum, {
    Opt: '0,5-1', mda: '1,3-2', d1: '2', s1: '4',
  });
  t.end();
});

function makeGraph() {
  const mdo = {
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
    edges: [{ from: 'A', to: 'B', name: 'a, b' },
    { from: 'C', to: 'A', name: 'CA' },
    { from: 'C', to: 'B', name: 'CB' },
    { from: 'C', to: 'D', name: 'CD' },
    { from: 'E', to: 'A', name: 'EA' }],
    workflow: [],
  };
  return new Graph(mdo);
}
test('Graph.findEdgesOf(nodeIdx) returns edges to remove and edges to delete in case of node removal', (t) => {
  const g = makeGraph();
  // find edges if A removed
  t.deepEqual(g.findEdgesOf(1), { toRemove: [g.edges[0], g.edges[1], g.edges[4]], toShift: [g.edges[2], g.edges[3]] });
  // find edges if C removed
  t.deepEqual(g.findEdgesOf(3), { toRemove: [g.edges[1], g.edges[2], g.edges[3]], toShift: [g.edges[4]] });
  // find edges if D removed
  t.deepEqual(g.findEdgesOf(4), { toRemove: [g.edges[3]], toShift: [g.edges[4]] });
  t.end();
});
test('Graph.addNode()', (t) => {
  const g = makeGraph();
  t.equal(g.nodes.length, 6);
  g.addNode({ id: 'F', name: 'F', kind: 'analysis' });
  t.equal(g.nodes.length, 7);
  t.end();
});
test('Graph.removeNode()', (t) => {
  const g = makeGraph();
  t.equal(g.nodes.length, 6);
  g.removeNode(4);
  t.equal(g.nodes.length, 5);
  t.end();
});
test('Graph.getNode()', (t) => {
  const g = makeGraph();
  t.equal(g.getNode('A'), g.nodes[1]);
  t.equal(g.getNode('E'), g.nodes[5]);
  t.end();
});
test('Graph.idxOf()', (t) => {
  const g = makeGraph();
  t.equal(g.idxOf('B'), 2);
  t.equal(g.idxOf('E'), 5);
  t.end();
});

test('Graph constructor should create a graph without edges or workflow input data)', (t) => {
  const mdo = { nodes: [{ id: 'A' }, { id: 'B' }] };
  const g = new Graph(mdo);
  t.deepEqual(g.edges, []);
  t.deepEqual(g.chains, []);
  t.end();
});
test('Graph nodes have a status UNKNOWN by default', (t) => {
  const g = new Graph({ nodes: [{ id: 'A' }, { id: 'B' }] });
  t.deepEqual(g.getNode('A').status, Graph.NODE_STATUS.UNKNOWN);
  t.end();
});
test('Graph nodes can be to a given status PENDING, RUNNING, DONE or FAILED', (t) => {
  const g = new Graph({
    nodes: [{ id: 'A', status: 'PENDING' },
    { id: 'B', status: 'RUNNING' },
    { id: 'C', status: 'DONE' },
    { id: 'D', status: 'FAILED' },
    ],
  });
  t.deepEqual(g.getNode('A').status, Graph.NODE_STATUS.PENDING);
  t.deepEqual(g.getNode('B').status, Graph.NODE_STATUS.RUNNING);
  t.deepEqual(g.getNode('C').status, Graph.NODE_STATUS.DONE);
  t.deepEqual(g.getNode('D').status, Graph.NODE_STATUS.FAILED);
  t.end();
});
test('Graph throws an error if a node status string not known', (t) => {
  t.throws(() => {
    const g = new Graph({ nodes: [{ id: 'A', status: 'BADSTATUS' }] });
  }, 'should throw an error');
  t.end();
});
test('Graph edge can have vars infos id/names from name', (t) => {
  const g = makeGraph();
  const actual = g.findEdge('A', 'B');
  t.deepEqual(actual.element.vars, { 0: 'a', 1: 'b' });
  t.end();
});

function makeGraph2() {
  const mdo = {
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
    edges: [{ from: 'A', to: 'B', vars: { 1: 'a', 2: 'b' } },
    { from: 'C', to: 'A', vars: { 1: 'a', 3: 'c' } },
    { from: 'C', to: 'B', vars: { 3: 'c', 2: 'b' } },
    { from: 'C', to: 'D', vars: { 3: 'c', 4: 'd' } },
    { from: 'E', to: 'A', vars: { 5: 'e', 1: 'a' } }],
    workflow: [],
  };
  return new Graph(mdo);
}
test('Graph edge can have vars infos id/names', (t) => {
  const g2 = makeGraph2();
  t.equal(g2.getNode('E'), g2.nodes[5]);
  const edgeCD = g2.findEdge('C', 'D').element;
  t.equal(edgeCD.vars['3'], 'c');
  t.equal(edgeCD.vars['4'], 'd');
  t.deepEqual(edgeCD.vars, { 3: 'c', 4: 'd' });
  t.equal(edgeCD.name, 'c, d');
  t.end();
});
test('Graph add new var between two given nodes not linked', (t) => {
  const g2 = makeGraph2();
  g2.addEdgeVar('A', 'D', { 4: 'd' });
  const edgeAD = g2.findEdge('A', 'D').element;
  t.equal(edgeAD.vars['4'], 'd');
  t.deepEqual(edgeAD.vars, { 4: 'd' });
  t.equal(edgeAD.name, 'd');
  t.end();
});
test('Graph a var should appear once even if added twice', (t) => {
  const g2 = makeGraph2();
  g2.addEdgeVar('A', 'D', { 4: 'd' });
  g2.addEdgeVar('A', 'D', { 4: 'd' });
  const edgeAD = g2.findEdge('A', 'D').element;
  t.equal(edgeAD.name, 'd');
  g2.removeEdge('A', 'D');
  const { index } = g2.findEdge('A', 'D');
  t.equal(edgeAD.index, undefined);
  t.end();
});
test('Graph add new var between two given nodes already linked', (t) => {
  const g2 = makeGraph2();
  g2.addEdgeVar('A', 'B', { 4: 'd' });
  const edgeAD = g2.findEdge('A', 'B').element;
  t.deepEqual(edgeAD.vars, { 1: 'a', 2: 'b', 4: 'd' });
  t.equal(edgeAD.name, 'a, b, d');
  t.end();
});
test('Remove var of an edge', (t) => {
  const g2 = makeGraph2();
  const edge = g2.findEdge('A', 'B').element;
  edge.removeVar('b');
  t.equal(edge.name, 'a');
  t.end();
});
test('Remove edge between two given nodes', (t) => {
  const g2 = makeGraph2();
  let edge = g2.findEdge('E', 'A').element;
  t.notEqual(edge, undefined);
  g2.removeEdge('E', 'A');
  edge = g2.findEdge('E', 'A').element;
  t.equal(edge, undefined);
  t.end();
});
test('Remove edge one var between two given nodes', (t) => {
  const g2 = makeGraph2();
  let edge = g2.findEdge('E', 'A').element;
  t.notEqual(edge, undefined);
  g2.removeEdgeVar('E', 'A', 'e');
  edge = g2.findEdge('E', 'A').element;
  t.deepEqual(edge.vars, { 1: 'a' });
  t.end();
});
test('Remove edge all vars between two given nodes', (t) => {
  const g2 = makeGraph2();
  let edge = g2.findEdge('E', 'A').element;
  t.notEqual(edge, undefined);
  g2.removeEdgeVar('E', 'A', 'e');
  g2.removeEdgeVar('E', 'A', 'a');
  edge = g2.findEdge('E', 'A').element;
  t.equal(edge, undefined);
  t.end();
});
test('find XDSMs order list', (t) => {
  t.deepEqual(XdsmFactory._orderedList({
    C: { nodes: [] },
    B: { nodes: [] },
    root: { nodes: [{ name: 'a', subxdsm: 'A' }] },
    A: { nodes: [{ name: 'c', subxdsm: 'C' }, { name: 'b', subxdsm: 'B' }] },
  }, 'root'), ['root', 'A', 'C', 'B']);
  t.end();
});
test('find XDSMs list of single', (t) => {
  t.deepEqual(XdsmFactory._orderedList({
    root: { nodes: [{ name: 'a', subxdsm: 'A' }] },
    A: { nodes: [{ name: 'c' }, { name: 'b' }] },
  }), ['root', 'A']);
  t.end();
});
test('find XDSMs list of empty xdsms', (t) => {
  t.deepEqual(XdsmFactory._orderedList({
    root: { nodes: [] },
  }), ['root']);
  t.end();
});
