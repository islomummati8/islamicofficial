(() => {
  function normalize(reminders, legacyTime, legacySentOn, idFactory = () => `reminder-legacy-${Date.now()}`) {
    const normalized = Array.isArray(reminders) ? reminders.filter(item => item
      && typeof item.id === 'string' && item.id.startsWith('reminder-')
      && /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)
      && ['daily', 'weekly', 'custom'].includes(item.frequency)
      && Array.isArray(item.weekdays) && item.weekdays.every(day => Number.isInteger(day) && day >= 0 && day <= 6)
      && ['none', 'gentle', 'bright'].includes(item.sound)
      && (item.lastSentOn === undefined || typeof item.lastSentOn === 'string')).slice(0, 10).map(item => ({
        id: item.id,
        time: item.time,
        frequency: item.frequency,
        weekdays: [...new Set(item.weekdays)],
        sound: item.sound,
        enabled: item.enabled !== false,
        lastSentOn: item.lastSentOn || ''
      })) : [];
    if (!normalized.length && typeof legacyTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(legacyTime)) {
      normalized.push({
        id: idFactory(),
        time: legacyTime,
        frequency: 'daily',
        weekdays: [],
        sound: 'none',
        enabled: true,
        lastSentOn: typeof legacySentOn === 'string' ? legacySentOn : ''
      });
    }
    return normalized;
  }

  function isDue(reminder, date, time, today) {
    if (!reminder?.enabled || reminder.time !== time || reminder.lastSentOn === today) return false;
    return reminder.frequency === 'daily' || reminder.weekdays.includes(date.getDay());
  }

  const api = { normalize, isDue };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.ISLAMIC_ZIKR_REMINDER_UTILS = api;
})();
