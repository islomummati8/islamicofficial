const assert = require('node:assert/strict');
const { test } = require('node:test');
const { isDue, normalize } = require('../public/zikr/reminder-utils.js');

test('migrates a saved single daily reminder without losing its sent date', () => {
  const reminders = normalize([], '08:30', '2025-01-06', () => 'reminder-legacy-test');

  assert.deepEqual(reminders, [{
    id: 'reminder-legacy-test',
    time: '08:30',
    frequency: 'daily',
    weekdays: [],
    sound: 'none',
    enabled: true,
    lastSentOn: '2025-01-06'
  }]);
});

test('normalizes reminder entries and drops invalid schedules', () => {
  const reminders = normalize([
    { id: 'reminder-a', time: '08:30', frequency: 'custom', weekdays: [1, 1, 5], sound: 'gentle' },
    { id: 'reminder-b', time: '25:00', frequency: 'daily', weekdays: [], sound: 'none' },
    { id: 'wrong-prefix', time: '09:00', frequency: 'daily', weekdays: [], sound: 'none' }
  ]);

  assert.equal(reminders.length, 1);
  assert.deepEqual(reminders[0].weekdays, [1, 5]);
  assert.equal(reminders[0].enabled, true);
});

test('matches weekly and selected weekday schedules once per local date', () => {
  const monday = new Date(2025, 0, 6, 8, 30);
  const tuesday = new Date(2025, 0, 7, 8, 30);
  const weekly = { enabled: true, time: '08:30', frequency: 'weekly', weekdays: [1], lastSentOn: '' };
  const selectedDays = { ...weekly, frequency: 'custom', weekdays: [2, 4] };

  assert.equal(isDue(weekly, monday, '08:30', '2025-01-06'), true);
  assert.equal(isDue(weekly, tuesday, '08:30', '2025-01-07'), false);
  assert.equal(isDue(selectedDays, tuesday, '08:30', '2025-01-07'), true);
  assert.equal(isDue(selectedDays, monday, '08:30', '2025-01-06'), false);
  assert.equal(isDue({ ...weekly, lastSentOn: '2025-01-06' }, monday, '08:30', '2025-01-06'), false);
  assert.equal(isDue({ ...weekly, enabled: false }, monday, '08:30', '2025-01-06'), false);
});
