// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const L = require('../session-logic.js');

const base = { current_question: 3, total_questions: 9, locked: true, revealed: false, ended: false, question_opened_at: null };
const st = (o) => Object.assign({}, base, o);

test('status follows the quiz_state flags', () => {
  assert.equal(L.questionStatus(st({}), false), 'waiting');
  assert.equal(L.questionStatus(st({ locked: false, question_opened_at: 'x' }), false), 'open');
  assert.equal(L.questionStatus(st({ locked: false, question_opened_at: 'x' }), true), 'timeup');
  assert.equal(L.questionStatus(st({ locked: true, question_opened_at: 'x' }), false), 'locked');
  assert.equal(L.questionStatus(st({ revealed: true, question_opened_at: 'x' }), false), 'revealed');
  assert.equal(L.questionStatus(st({ ended: true }), false), 'ended');
});

test('primary action for each state', () => {
  assert.equal(L.primaryAction(st({}), true, false).id, 'open');
  assert.equal(L.primaryAction(st({ locked: false, question_opened_at: 'x' }), true, false).id, 'lock');
  assert.equal(L.primaryAction(st({ locked: false, question_opened_at: 'x' }), true, true).id, 'reveal');
  assert.equal(L.primaryAction(st({ question_opened_at: 'x' }), true, false).id, 'reveal');
  assert.equal(L.primaryAction(st({ revealed: true, question_opened_at: 'x' }), true, false).id, 'next');
});

test('last question → finish; ended → new round', () => {
  const a = L.primaryAction(st({ current_question: 9, revealed: true, question_opened_at: 'x' }), true, false);
  assert.equal(a.id, 'endsess');
  assert.equal(L.primaryAction(st({ ended: true }), true, false).id, 'newround');
});

test('reveal is disabled, with a reason, when there is no answer key', () => {
  const a = L.primaryAction(st({ question_opened_at: 'x' }), false, false);
  assert.equal(a.id, 'reveal'); assert.equal(a.disabled, true); assert.match(a.reason, /answer key/);
});

test('secondary actions keep reopen / reveal-now available without competing', () => {
  const open = L.secondaryActions(st({ locked: false, question_opened_at: 'x' }), true, false).map(a => a.id);
  assert.deepEqual(open, ['reveal', 'open']);
  const locked = L.secondaryActions(st({ question_opened_at: 'x' }), true, false).map(a => a.id);
  assert.deepEqual(locked, ['open']);
  assert.deepEqual(L.secondaryActions(st({ revealed: true, question_opened_at: 'x' }), true, false), []);
});

test('results summary distinguishes answered from correct and uses all participants as denominator', () => {
  const r = L.resultsSummary(['a', 'b', 'c', 'd'], { a: { choice: 'B', is_correct: true }, b: { choice: 'C', is_correct: false }, c: { choice: 'B', is_correct: true } }, 'B');
  assert.deepEqual([r.answered, r.right, r.total, r.pct], [3, 2, 4, 50]);
  assert.deepEqual(r.dist, { B: 2, C: 1 });
});

test('empty session', () => {
  const r = L.resultsSummary([], {}, 'A');
  assert.deepEqual([r.answered, r.right, r.total, r.pct], [0, 0, 0, 0]);
});
