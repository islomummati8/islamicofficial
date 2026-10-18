const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

const source = readFileSync('public/kids/kids.js', 'utf8');
const start = source.indexOf('  const easyQuestions = [');
const end = source.indexOf('  const bestKey =', start);
assert.notEqual(start, -1, 'Question banks should exist.');
assert.notEqual(end, -1, 'Question bank declarations should end before quiz state.');
const declarations = source.slice(start, end);
const questionSets = runInNewContext(`${declarations}\nquestionSets;`);

test('provides a shuffled question bank for each difficulty', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(questionSets).map(([level, questions]) => [level, questions.length])),
    { easy: 20, medium: 20, hard: 15 }
  );
});

test('every children quiz question has three choices and a valid answer', () => {
  for (const [level, questions] of Object.entries(questionSets)) {
    for (const question of questions) {
      assert.equal(typeof question.text, 'string', `${level} question is missing its text.`);
      assert.equal(question.options.length, 3, `${question.text} must have three choices.`);
      assert.ok(Number.isInteger(question.answer), `${question.text} must have an integer answer index.`);
      assert.ok(question.answer >= 0 && question.answer < question.options.length, `${question.text} answer is out of range.`);
      assert.equal(typeof question.note, 'string', `${question.text} is missing its explanation.`);
    }
  }
});
