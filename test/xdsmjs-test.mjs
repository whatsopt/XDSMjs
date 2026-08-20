import { select } from 'd3-selection';
import { JSDOM } from 'jsdom';
import test from 'tape';
import Labelizer from '../src/labelizer.js';
import Graph from '../src/graph.js';
import XdsmFactory from '../src/xdsm-factory.js';
import Controls from '../src/controls.js';
import Selectable from '../src/selectable.js';

test("Labelizer.strParse('') returns [{'base':'', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse(''), [{ base: '', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('+A') throws an error", (t) => {
  t.throws(() => {
    Labelizer.strParse('+');
  }, 'should throw an error');
  t.end();
});
test("Labelizer.strParse('ConvCheck') returns [{'base':'ConvCheck', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('ConvCheck'), [
    { base: 'ConvCheck', sub: undefined, sup: undefined },
  ]);
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
test(
  "Labelizer.strParse('&#x03BB_&#x03BB^&#x03BB') " +
    "returns [{'base':'&#x03BB', 'sub':'&#x03BB', 'sup':'&#x03BB'}]",
  (t) => {
    t.deepEqual(Labelizer.strParse('&#x03BB_&#x03BB^&#x03BB'), [
      { base: '&#x03BB', sub: '&#x03BB', sup: '&#x03BB' },
    ]);
    t.end();
  }
);
test(
  "Labelizer.strParse('Optimization') " +
    "returns [{'base':'Optimization', 'sub':undefined, 'sup':undefined}]",
  (t) => {
    t.deepEqual(Labelizer.strParse('Optimization'), [
      { base: 'Optimization', sub: undefined, sup: undefined },
    ]);
    t.end();
  }
);

test("Labelizer.strParse('x_12') returns [{'base':'x', 'sub': '12', 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_12'), [{ base: 'x', sub: '12', sup: undefined }]);
  t.end();
});

test("Labelizer.strParse('x_13^{(0)}') returns [{'base':'x', 'sub': '13', 'sup': '(0)'}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_13^{(0)}'), [{ base: 'x', sub: '13', sup: '(0)' }]);
  t.end();
});
test(
  "Labelizer.strParse('x_13^{(0)}, y_1^{*}') returns [{'base': 'x', 'sub': '13', 'sup': '(0)'}, " +
    "{'base':'y', 'sub': '1', 'sup': '*'}]",
  (t) => {
    t.deepEqual(Labelizer.strParse('x_13^{(0)}, y_1^{*}'), [
      { base: 'x', sub: '13', sup: '(0)' },
      { base: 'y', sub: '1', sup: '*' },
    ]);
    t.end();
  }
);
test("Labelizer.strParse('1:Opt') returns [{'base':'1:Opt', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('1:Opt'), [{ base: '1:Opt', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('1:L-BFGS-B') returns [{'base':'1:L-BFGS-B', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('1:L-BFGS-B'), [
    { base: '1:L-BFGS-B', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('y_12_y_34') returns [{'base':'y_12_y_34', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('y_12_y_34'), [
    { base: 'y_12_y_34', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('y_12_y_34^*') returns [{'base':'y_12_y_34', 'sub':undefined, 'sup':'*'}]", (t) => {
  t.deepEqual(Labelizer.strParse('y_12_y_34^*'), [{ base: 'y_12_y_34', sub: undefined, sup: '*' }]);
  t.end();
});
// Unicode letters, marks and digits in labels
test("Labelizer.strParse('Aérodynamique') returns the whole accented word as base", (t) => {
  t.deepEqual(Labelizer.strParse('Aérodynamique'), [
    { base: 'Aérodynamique', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('λ') returns [{'base':'λ', 'sub':undefined, 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('λ'), [{ base: 'λ', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('Δp_c') returns [{'base':'Δp', 'sub':'c', 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('Δp_c'), [{ base: 'Δp', sub: 'c', sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('y_aéro') returns [{'base':'y', 'sub':'aéro', 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('y_aéro'), [{ base: 'y', sub: 'aéro', sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('λ_ρ^Δ') returns [{'base':'λ', 'sub':'ρ', 'sup':'Δ'}]", (t) => {
  t.deepEqual(Labelizer.strParse('λ_ρ^Δ'), [{ base: 'λ', sub: 'ρ', sup: 'Δ' }]);
  t.end();
});
// Non regression on ASCII labels
test("Labelizer.strParse('x_1^(0)') returns [{'base':'x', 'sub':'1', 'sup':'(0)'}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_1^(0)'), [{ base: 'x', sub: '1', sup: '(0)' }]);
  t.end();
});
test("Labelizer.strParse('y_12^*') returns [{'base':'y', 'sub':'12', 'sup':'*'}]", (t) => {
  t.deepEqual(Labelizer.strParse('y_12^*'), [{ base: 'y', sub: '12', sup: '*' }]);
  t.end();
});
test("Labelizer.strParse('1, 7-2:Optimizer') keeps the process numbering prefix", (t) => {
  t.deepEqual(Labelizer.strParse('1, 7-2:Optimizer'), [
    { base: '1', sub: undefined, sup: undefined },
    { base: '7-2:Optimizer', sub: undefined, sup: undefined },
  ]);
  t.end();
});

// Spaces inside a base name
test("Labelizer.strParse('MDA Gauss-Seidel') keeps the whole name as base", (t) => {
  t.deepEqual(Labelizer.strParse('MDA Gauss-Seidel'), [
    { base: 'MDA Gauss-Seidel', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('Discipline 1') keeps the whole name as base", (t) => {
  t.deepEqual(Labelizer.strParse('Discipline 1'), [
    { base: 'Discipline 1', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('Opt. disciplinaires') keeps the whole name as base", (t) => {
  t.deepEqual(Labelizer.strParse('Opt. disciplinaires'), [
    { base: 'Opt. disciplinaires', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('Opt. disciplinaires_1^(0)') splits a spaced base from sub and sup", (t) => {
  t.deepEqual(Labelizer.strParse('Opt. disciplinaires_1^(0)'), [
    { base: 'Opt. disciplinaires', sub: '1', sup: '(0)' },
  ]);
  t.end();
});
test("Labelizer.strParse('1:MDA Gauss-Seidel') keeps the process numbering prefix", (t) => {
  t.deepEqual(Labelizer.strParse('1:MDA Gauss-Seidel'), [
    { base: '1:MDA Gauss-Seidel', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('0, 6-1:MDA Gauss-Seidel') keeps a multi-part numbering prefix", (t) => {
  t.deepEqual(Labelizer.strParse('0, 6-1:MDA Gauss-Seidel'), [
    { base: '0', sub: undefined, sup: undefined },
    { base: '6-1:MDA Gauss-Seidel', sub: undefined, sup: undefined },
  ]);
  t.end();
});
// Non regression on variable lists: the separating space is still trimmed
test("Labelizer.strParse('x_1, z') returns one token per variable", (t) => {
  t.deepEqual(Labelizer.strParse('x_1, z'), [
    { base: 'x', sub: '1', sup: undefined },
    { base: 'z', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('f,c') returns one token per variable", (t) => {
  t.deepEqual(Labelizer.strParse('f,c'), [
    { base: 'f', sub: undefined, sup: undefined },
    { base: 'c', sub: undefined, sup: undefined },
  ]);
  t.end();
});

// LaTeX braces around a subscript or a superscript group without being displayed
test("Labelizer.strParse('x^{(0)}') returns [{'base':'x', 'sub':undefined, 'sup':'(0)'}]", (t) => {
  t.deepEqual(Labelizer.strParse('x^{(0)}'), [{ base: 'x', sub: undefined, sup: '(0)' }]);
  t.end();
});
test("Labelizer.strParse('x_{12}') returns [{'base':'x', 'sub':'12', 'sup':undefined}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_{12}'), [{ base: 'x', sub: '12', sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('x_{13}^{(0)}') returns [{'base':'x', 'sub':'13', 'sup':'(0)'}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_{13}^{(0)}'), [{ base: 'x', sub: '13', sup: '(0)' }]);
  t.end();
});
test("Labelizer.strParse('x_{shared}^(0)') returns [{'base':'x', 'sub':'shared', 'sup':'(0)'}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_{shared}^(0)'), [{ base: 'x', sub: 'shared', sup: '(0)' }]);
  t.end();
});
test("Labelizer.strParse('y_{aero total}') allows spaces inside a braced subscript", (t) => {
  t.deepEqual(Labelizer.strParse('y_{aero total}'), [
    { base: 'y', sub: 'aero total', sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('y_12_y_34^{*}') strips braces on the multiple underscores path", (t) => {
  t.deepEqual(Labelizer.strParse('y_12_y_34^{*}'), [
    { base: 'y_12_y_34', sub: undefined, sup: '*' },
  ]);
  t.end();
});
// Braces not introduced by _ or ^ stay literal
test("Labelizer.strParse('{foo}') keeps the braces in the base", (t) => {
  t.deepEqual(Labelizer.strParse('{foo}'), [{ base: '{foo}', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('\\foo{y}') keeps an unsupported command literal", (t) => {
  t.deepEqual(Labelizer.strParse('\\foo{y}'), [
    { base: '\\foo{y}', sub: undefined, sup: undefined },
  ]);
  t.end();
});
// LaTeX accents fold into the base as a combining mark, normalized to NFC:
// a precomposed character when Unicode has one, a combining sequence otherwise.
test("Labelizer.strParse('\\hat{y}') returns the precomposed 'y with circumflex' (U+0177)", (t) => {
  t.deepEqual(Labelizer.strParse('\\hat{y}'), [{ base: '\u0177', sub: undefined, sup: undefined }]);
  t.end();
});
test("Labelizer.strParse('\\hat{x}') returns 'x' plus a combining circumflex (U+0302)", (t) => {
  t.deepEqual(Labelizer.strParse('\\hat{x}'), [
    { base: 'x\u0302', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('\\bar{x}') returns 'x' plus a combining macron (U+0304)", (t) => {
  t.deepEqual(Labelizer.strParse('\\bar{x}'), [
    { base: 'x\u0304', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('\\tilde{z}') returns 'z' plus a combining tilde (U+0303)", (t) => {
  t.deepEqual(Labelizer.strParse('\\tilde{z}'), [
    { base: 'z\u0303', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('\\hat{Cd}') accents the first character of the base", (t) => {
  t.deepEqual(Labelizer.strParse('\\hat{Cd}'), [
    { base: '\u0108d', sub: undefined, sup: undefined },
  ]);
  t.end();
});
test("Labelizer.strParse('\\hat{y}_2^{(0)}') composes an accent with sub and sup", (t) => {
  t.deepEqual(Labelizer.strParse('\\hat{y}_2^{(0)}'), [{ base: '\u0177', sub: '2', sup: '(0)' }]);
  t.end();
});
test("Labelizer.strParse('\\hat{y}_{2}^{*}, \\bar{x}') parses a list of accented variables", (t) => {
  t.deepEqual(Labelizer.strParse('\\hat{y}_{2}^{*}, \\bar{x}'), [
    { base: '\u0177', sub: '2', sup: '*' },
    { base: 'x\u0304', sub: undefined, sup: undefined },
  ]);
  t.end();
});
// Non regression on the brace-less forms
test("Labelizer.strParse('x_shared^(0)') returns [{'base':'x', 'sub':'shared', 'sup':'(0)'}]", (t) => {
  t.deepEqual(Labelizer.strParse('x_shared^(0)'), [{ base: 'x', sub: 'shared', sup: '(0)' }]);
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
  t.deepEqual(Graph.expand(['a0', ['b1', 'b2', 'b3'], 'c3']), [
    ['a0', 'b1', 'b2', 'b3', 'a0', 'c3'],
  ]);
  t.end();
});
test("Graph.expand(['opt', ['mda', ['d1', 'd2', 'd3'],'func']]) returns [['opt', 'mda', 'd1', 'd2', 'd3', 'mda','func', 'opt']]", (t) => {
  t.deepEqual(Graph.expand(['opt', ['mda', ['d1', 'd2', 'd3'], 'func']]), [
    ['opt', 'mda', 'd1', 'd2', 'd3', 'mda', 'func', 'opt'],
  ]);
  t.end();
});
test("Graph.expand([{parallel: ['d1', 'd2']}]) returns [[d1], [d2]]", (t) => {
  t.deepEqual(Graph.expand([{ parallel: ['d1', 'd2'] }]), [['d1'], ['d2']]);
  t.end();
});
test("Graph.expand([{parallel: ['d1', 'd2']}]) returns [[d1], [d2]]", (t) => {
  t.deepEqual(Graph.expand([{ parallel: ['d1', 'd2'] }]), [['d1'], ['d2']]);
  t.end();
});
test("Graph.expand(['opt', {parallel: ['d1', 'd2', 'd3']}]) returns [['opt', 'd1'], ['opt', 'd2'], ['opt', 'd3']]", (t) => {
  t.deepEqual(Graph.expand(['opt', { parallel: ['d1', 'd2', 'd3'] }]), [
    ['opt', 'd1'],
    ['opt', 'd2'],
    ['opt', 'd3'],
  ]);
  t.end();
});
test("Graph.expand(['opt', [{parallel: ['d1', 'd2', 'd3']}]]) returns [['opt', 'd1', 'opt'], ['opt', 'd2', 'opt'], ['opt', 'd3', 'opt']]", (t) => {
  t.deepEqual(Graph.expand(['opt', [{ parallel: ['d1', 'd2', 'd3'] }]]), [
    ['opt', 'd1', 'opt'],
    ['opt', 'd2', 'opt'],
    ['opt', 'd3', 'opt'],
  ]);
  t.end();
});
test("Graph.expand(['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']) returns [['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]", (t) => {
  t.deepEqual(Graph.expand(['mda', { parallel: ['d1', 'd2', 'd3'] }, 'd4']), [
    ['mda', 'd1', 'd4'],
    ['mda', 'd2', 'd4'],
    ['mda', 'd3', 'd4'],
  ]);
  t.end();
});
test("Graph.expand(['opt', 'mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]) returns [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4']]", (t) => {
  t.deepEqual(Graph.expand(['opt', 'mda', { parallel: ['d1', 'd2', 'd3'] }, 'd4']), [
    ['opt', 'mda'],
    ['mda', 'd1', 'd4'],
    ['mda', 'd2', 'd4'],
    ['mda', 'd3', 'd4'],
  ]);
  t.end();
});
test("Graph.expand(['opt', ['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]) returns [['opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt']]", (t) => {
  t.deepEqual(Graph.expand(['opt', ['mda', { parallel: ['d1', 'd2', 'd3'] }, 'd4']]), [
    ['opt', 'mda'],
    ['mda', 'd1', 'd4'],
    ['mda', 'd2', 'd4'],
    ['mda', 'd3', 'd4'],
    ['d4', 'opt'],
  ]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', {parallel: ['d1', 'd2', 'd3']}, 'd4']]]) returns [['_U_', 'opt', 'mda'], ['mda', 'd1', 'd4'], ['mda', 'd2', 'd4'], ['mda', 'd3', 'd4'], ['d4', 'opt', '_U_']]", (t) => {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', { parallel: ['d1', 'd2', 'd3'] }, 'd4']]]), [
    ['_U_', 'opt', 'mda'],
    ['mda', 'd1', 'd4'],
    ['mda', 'd2', 'd4'],
    ['mda', 'd3', 'd4'],
    ['d4', 'opt', '_U_'],
  ]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", (t) => {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', ['d1', 'd2']]]]), [
    ['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_'],
  ]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2'], 'mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", (t) => {
  t.deepEqual(Graph.expand(['_U_', ['opt', ['mda', ['d1', 'd2'], 'mda', ['d1', 'd2']]]]), [
    ['_U_', 'opt', 'mda', 'd1', 'd2', 'mda', 'mda', 'd1', 'd2', 'mda', 'opt', '_U_'],
  ]);
  t.end();
});
test("Graph.expand((['_U_', ['opt', ['mda', ['d1', 'd2'], {parallel: ['sc1', 'sc2']},'mda', ['d1', 'd2']]]]) returns [['_U_', 'opt', 'mda', 'd1', 'd2', 'mda'], ['mda', 'sc1', 'mda'], ['mda', 'sc2', 'mda'], ['mda', 'd1', 'd2', 'mda', 'opt', '_U_']]", (t) => {
  t.deepEqual(
    Graph.expand([
      '_U_',
      ['opt', ['mda', ['d1', 'd2'], { parallel: ['sc1', 'sc2'] }, 'mda', ['d1', 'd2']]],
    ]),
    [
      ['_U_', 'opt', 'mda', 'd1', 'd2', 'mda'],
      ['mda', 'sc1', 'mda'],
      ['mda', 'sc2', 'mda'],
      ['mda', 'd1', 'd2', 'mda', 'opt', '_U_'],
    ]
  );
  t.end();
});
test("Graph.expand((['d1', {parallel: ['sc1', 'sc2']}, 'd2']) returns [['d1', 'sc1', 'd2'], ['d1', 'sc2', 'd2']]", (t) => {
  t.deepEqual(Graph.expand(['d1', { parallel: ['sc1', 'sc2'] }, 'd2']), [
    ['d1', 'sc1', 'd2'],
    ['d1', 'sc2', 'd2'],
  ]);
  t.end();
});
test("Graph.expand((['opt', ['d1', {parallel: ['sc1', 'sc2']}]]) returns [['opt', 'd1'] ['d1', 'sc1', 'opt'], ['d1', 'sc2', 'opt']]", (t) => {
  t.deepEqual(Graph.expand(['opt', ['d1', { parallel: ['sc1', 'sc2'] }]]), [
    ['opt', 'd1'],
    ['d1', 'sc1', 'opt'],
    ['d1', 'sc2', 'opt'],
    ['opt', 'opt'],
  ]);
  t.end();
});
test('Graph.chains should expand as list of index couples', (t) => {
  const g = new Graph({
    nodes: [
      { id: 'Opt', name: 'Opt' },
      { id: 'MDA', name: 'MDA' },
      { id: 'DA1', name: 'DA1' },
      { id: 'DA2', name: 'DA2' },
      { id: 'DA3', name: 'DA3' },
      { id: 'Func', name: 'Func' },
    ],
    edges: [],
    workflow: ['Opt', ['MDA', ['DA1', 'DA2', 'DA3'], 'Func']],
  });
  t.deepEqual(g.chains, [
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 2],
      [2, 6],
      [6, 1],
    ],
  ]);
  t.end();
});
test('Graph.chains should expand as list of index couples', (t) => {
  const g = new Graph({
    nodes: [
      { id: 'Opt', name: 'Opt' },
      { id: 'DA1', name: 'DA1' },
      { id: 'DA2', name: 'DA2' },
      { id: 'DA3', name: 'DA3' },
      { id: 'Func', name: 'Func' },
    ],
    edges: [],
    workflow: [['Opt', ['DA1'], 'Opt', ['DA2'], 'Opt', ['DA3'], 'Func']],
  });
  t.deepEqual(g.chains, [
    [
      [1, 2],
      [2, 1],
      [1, 3],
      [3, 1],
      [1, 4],
      [4, 1],
      [1, 5],
    ],
  ]);
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
    mda: '0',
    d1: '1',
    d2: '2',
    d3: '3',
  });
  t.end();
});
test("Graph.number(['mda', ['d1', 'd2', 'd3']]) returns {mda: '0,4-1', d1: '1', d2: '2', d3: '3'} )", (t) => {
  t.deepEqual(Graph.number(['mda', ['d1', 'd2', 'd3']]).toNum, {
    mda: '0,4-1',
    d1: '1',
    d2: '2',
    d3: '3',
  });
  t.end();
});
test("Graph.number(['mda', {parallel:['d1', 'd2', 'd3']}]) returns {'mda': '0', 'd1': '1', 'd2': '1', 'd3': '1'})", (t) => {
  t.deepEqual(Graph.number(['mda', { parallel: ['d1', 'd2', 'd3'] }]).toNum, {
    mda: '0',
    d1: '1',
    d2: '1',
    d3: '1',
  });
  t.end();
});
test("Graph.number(['mda', [{parallel:['d1', 'd2', 'd3']}]]) returns {'toNum':{'mda': '0,2-1', 'd1': '1', 'd2': '1', 'd3': '1'}, 'toNode':[['mda'], ['d1','d2','d3']]})", (t) => {
  t.deepEqual(Graph.number(['mda', [{ parallel: ['d1', 'd2', 'd3'] }]]).toNum, {
    mda: '0,2-1',
    d1: '1',
    d2: '1',
    d3: '1',
  });
  t.deepEqual(Graph.number(['mda', [{ parallel: ['d1', 'd2', 'd3'] }]]).toNode, [
    ['mda'],
    ['d1', 'd2', 'd3'],
    ['mda'],
  ]);
  t.end();
});
test("Graph.number(['opt', 'mda', ['d1', 'd2', 'd3']]) returns {'opt': '0', 'mda': '1,5-2', 'd1': '2', 'd2': '3', 'd3': '4'})", (t) => {
  t.deepEqual(Graph.number(['opt', 'mda', ['d1', 'd2', 'd3']]).toNum, {
    opt: '0',
    mda: '1,5-2',
    d1: '2',
    d2: '3',
    d3: '4',
  });
  t.end();
});
test("Graph.number([['opt', ['mda', ['d1', 'd2', 'd3']]], 'd4']) returns {'opt': '0,6-1', 'mda': '1,5-2', 'd1': '2', 'd2': '3', 'd3': '4', 'd4': '7'})", (t) => {
  t.deepEqual(Graph.number([['opt', ['mda', ['d1', 'd2', 'd3']]], 'd4']).toNum, {
    opt: '0,6-1',
    mda: '1,5-2',
    d1: '2',
    d2: '3',
    d3: '4',
    d4: '7',
  });
  t.end();
});
test("Graph.number([['Opt', ['mda', ['d1'], 's1']]]) returns {'Opt': '0,5-1', 'mda': '1,3-2', 'd1': '2', 's1': '4'})", (t) => {
  t.deepEqual(Graph.number([['Opt', ['mda', ['d1'], 's1']]]).toNum, {
    Opt: '0,5-1',
    mda: '1,3-2',
    d1: '2',
    s1: '4',
  });
  t.end();
});

function makeGraph() {
  const mdo = {
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
    edges: [
      { from: 'A', to: 'B', name: 'a, b' },
      { from: 'C', to: 'A', name: 'CA' },
      { from: 'C', to: 'B', name: 'CB' },
      { from: 'C', to: 'D', name: 'CD' },
      { from: 'E', to: 'A', name: 'EA' },
    ],
    workflow: [],
  };
  return new Graph(mdo);
}
test('Graph.findEdgesOf(nodeIdx) returns edges to remove and edges to delete in case of node removal', (t) => {
  const g = makeGraph();
  // find edges if A removed
  t.deepEqual(g.findEdgesOf(1), {
    toRemove: [g.edges[0], g.edges[1], g.edges[4]],
    toShift: [g.edges[2], g.edges[3]],
  });
  // find edges if C removed
  t.deepEqual(g.findEdgesOf(3), {
    toRemove: [g.edges[1], g.edges[2], g.edges[3]],
    toShift: [g.edges[4]],
  });
  // find edges if D removed
  t.deepEqual(g.findEdgesOf(4), {
    toRemove: [g.edges[3]],
    toShift: [g.edges[4]],
  });
  t.end();
});
test('Graph.addNode()', (t) => {
  const g = makeGraph();
  t.equal(g.nodes.length, 6);
  g.addNode({ id: 'F', name: 'F', kind: 'function' });
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
    nodes: [
      { id: 'A', status: 'PENDING' },
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
    edges: [
      { from: 'A', to: 'B', vars: { 1: 'a', 2: 'b' } },
      { from: 'C', to: 'A', vars: { 1: 'a', 3: 'c' } },
      { from: 'C', to: 'B', vars: { 3: 'c', 2: 'b' } },
      { from: 'C', to: 'D', vars: { 3: 'c', 4: 'd' } },
      { from: 'E', to: 'A', vars: { 5: 'e', 1: 'a' } },
    ],
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
  t.deepEqual(
    XdsmFactory._orderedList(
      {
        C: { nodes: [] },
        B: { nodes: [] },
        root: { nodes: [{ name: 'a', subxdsm: 'A' }] },
        A: {
          nodes: [
            { name: 'c', subxdsm: 'C' },
            { name: 'b', subxdsm: 'B' },
          ],
        },
      },
      'root'
    ),
    ['root', 'A', 'C', 'B']
  );
  t.end();
});
test('find XDSMs list of single', (t) => {
  t.deepEqual(
    XdsmFactory._orderedList({
      root: { nodes: [{ name: 'a', subxdsm: 'A' }] },
      A: { nodes: [{ name: 'c' }, { name: 'b' }] },
    }),
    ['root', 'A']
  );
  t.end();
});
test('find XDSMs list of empty xdsms', (t) => {
  t.deepEqual(
    XdsmFactory._orderedList({
      root: { nodes: [] },
    }),
    ['root']
  );
  t.end();
});

function withDom(html, run) {
  const dom = new JSDOM(html);
  const prevWindow = global.window;
  const prevDocument = global.document;
  global.window = dom.window;
  global.document = dom.window.document;
  try {
    run(dom.window);
  } finally {
    dom.window.close();
    global.window = prevWindow;
    global.document = prevDocument;
  }
}

test('Controls wires toolbar actions to animation methods', (t) => {
  withDom('<div class="xdsm-toolbar"></div><div class="xdsm2"></div>', (window) => {
    const calls = {
      start: 0,
      stop: 0,
      stepPrev: 0,
      stepNext: 0,
      setXdsmVersion: [],
      addObserver: 0,
      reset: 0,
    };
    const animation = {
      status: 'ready',
      start: () => {
        calls.start += 1;
      },
      stop: () => {
        calls.stop += 1;
      },
      stepPrev: () => {
        calls.stepPrev += 1;
      },
      stepNext: () => {
        calls.stepNext += 1;
      },
      setXdsmVersion: (version) => {
        calls.setXdsmVersion.push(version);
      },
      addObserver: () => {
        calls.addObserver += 1;
      },
      reset: () => {
        calls.reset += 1;
      },
    };

    const controls = new Controls(animation, 'xdsm2');

    controls.startButton.node().dispatchEvent(new window.Event('click', { bubbles: true }));
    controls.stopButton.node().dispatchEvent(new window.Event('click', { bubbles: true }));
    controls.stepPrevButton.node().dispatchEvent(new window.Event('click', { bubbles: true }));
    controls.stepNextButton.node().dispatchEvent(new window.Event('click', { bubbles: true }));

    controls.toggleVersionButton.property('value', 'xdsm2');
    controls.toggleVersionButton
      .node()
      .dispatchEvent(new window.Event('change', { bubbles: true }));

    t.equal(calls.addObserver, 1);
    t.equal(calls.start, 1);
    t.equal(calls.stop, 1);
    t.equal(calls.stepPrev, 1);
    t.equal(calls.stepNext, 1);
    t.deepEqual(calls.setXdsmVersion, ['xdsm2']);
  });
  t.end();
});

test('Selectable updates filter for node and edge click', (t) => {
  withDom(
    '<svg id="root">' +
      '<g class="node idA"><rect class="shape"></rect></g>' +
      '<g class="edge idlink_A_B"><rect class="shape"></rect></g>' +
      '</svg>',
    (window) => {
      const filters = [];
      const xdsm = {
        graph: {
          getNodeFromIndex: (idx) => ({ id: idx === 1 ? 'A' : 'B' }),
        },
      };

      select('.node.idA').datum({ id: 'A' });
      select('.edge.idlink_A_B').datum({ id: 'link_A_B', iotype: 'out', row: 1, col: 2 });

      const selectable = new Selectable(xdsm, (filter) => {
        filters.push({ ...filter });
      });

      select('.node.idA')
        .node()
        .dispatchEvent(new window.Event('click', { bubbles: true }));
      t.deepEqual(selectable.getFilter(), { fr: 'A', to: 'A' });

      select('.edge.idlink_A_B')
        .node()
        .dispatchEvent(new window.Event('click', { bubbles: true }));
      t.deepEqual(selectable.getFilter(), { fr: 'A', to: 'B' });

      t.deepEqual(filters[0], { fr: 'A', to: 'A' });
      t.deepEqual(filters[1], { fr: 'A', to: 'B' });
    }
  );
  t.end();
});

test('Labelizer.labelize renders a Unicode node name in a single tspan', (t) => {
  withDom('<svg id="root"></svg>', () => {
    const g = select('#root').append('g').datum({ name: 'Aérodynamique' });
    g.call(Labelizer.labelize());
    const tspans = g.selectAll('tspan').nodes();
    t.equal(tspans.length, 1);
    t.equal(tspans[0].innerHTML, 'Aérodynamique');
  });
  t.end();
});

test('Labelizer.labelize renders a Unicode subscript in its own tspan', (t) => {
  withDom('<svg id="root"></svg>', () => {
    const g = select('#root').append('g').datum({ name: 'Δp_c' });
    g.call(Labelizer.labelize());
    const tspans = g.selectAll('tspan').nodes();
    t.deepEqual(
      tspans.map((n) => n.innerHTML),
      ['Δp', 'c']
    );
    t.equal(tspans[1].getAttribute('class'), 'sub');
  });
  t.end();
});

test('Labelizer.tooltipize renders Unicode sub/sup as HTML', (t) => {
  withDom('<div id="tip"></div>', () => {
    const tip = select('#tip');
    tip.call(Labelizer.tooltipize().subSupScript(true).text('Δp_c, y_aéro^*'));
    t.equal(tip.html(), 'Δp<sub>c</sub>, y<sub>aéro</sub><sup>*</sup>');
  });
  t.end();
});

test('Labelizer.labelize renders a spaced node name in a single tspan', (t) => {
  withDom('<svg id="root"></svg>', () => {
    const g = select('#root').append('g').datum({ name: '1:MDA Gauss-Seidel' });
    g.call(Labelizer.labelize().labelKind('node'));
    const tspans = g.selectAll('tspan').nodes();
    t.equal(tspans.length, 1);
    t.equal(tspans[0].innerHTML, '1:MDA Gauss-Seidel');
  });
  t.end();
});

test('Labelizer.tooltipize keeps spaces inside a base name', (t) => {
  withDom('<div id="tip"></div>', () => {
    const tip = select('#tip');
    tip.call(Labelizer.tooltipize().subSupScript(true).text('Discipline 1, x_1'));
    t.equal(tip.html(), 'Discipline 1, x<sub>1</sub>');
  });
  t.end();
});

test('Labelizer.labelize renders an accented base composed with sub and sup', (t) => {
  withDom('<svg id="root"></svg>', () => {
    const g = select('#root').append('g').datum({ name: '\\hat{y}_2^{(0)}' });
    g.call(Labelizer.labelize());
    const tspans = g.selectAll('tspan').nodes();
    t.deepEqual(
      tspans.map((n) => n.innerHTML),
      ['\u0177', '2', '(0)']
    );
    t.equal(tspans[1].getAttribute('class'), 'sub');
    t.equal(tspans[2].getAttribute('class'), 'sup');
  });
  t.end();
});

test('Labelizer.tooltipize renders an accented base with sub and sup', (t) => {
  withDom('<div id="tip"></div>', () => {
    const tip = select('#tip');
    tip.call(Labelizer.tooltipize().subSupScript(true).text('\\hat{y}_2^{(0)}, x_{13}'));
    t.equal(tip.html(), '\u0177<sub>2</sub><sup>(0)</sup>, x<sub>13</sub>');
  });
  t.end();
});

test('Labelizer.labelize leaves markup untouched when subSupScript is off', (t) => {
  withDom('<svg id="root"></svg>', () => {
    const g = select('#root').append('g').datum({ name: '\\hat{y}_2' });
    g.call(Labelizer.labelize().subSupScript(false));
    const tspans = g.selectAll('tspan').nodes();
    t.equal(tspans.length, 1);
    t.equal(tspans[0].innerHTML, '\\hat{y}_2');
  });
  t.end();
});
