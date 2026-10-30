import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calendarUrl, clockLabel } from './booking-utils.js';
import { bookingConfig } from './config.js';

// A missing/unverified backend must never silently open a booking form.
assert.equal(calendarUrl({ enabled: false, calLink: 'example/conversation' }), null);
for (const calLink of ['', 'https://evil.example/book', '//evil.example/x', '../book', 'user/book?redirect=evil', 'user/book#x']) {
  assert.equal(calendarUrl({ enabled: true, calLink }), null);
}
const url = calendarUrl({ enabled: true, calLink: 'example/conversation' });
assert.equal(url.origin, 'https://cal.com');
assert.equal(url.pathname, '/example/conversation');
// LA crosses the DST boundary on November 1, 2026; use IANA rules, not UTC-7.
assert.equal(clockLabel(new Date('2026-11-01T08:30:00Z'), 'America/Los_Angeles', 'en'), 'LOS ANGELES · 01:30');
assert.equal(clockLabel(new Date('2026-11-01T09:30:00Z'), 'America/Los_Angeles', 'en'), 'LOS ANGELES · 01:30');
assert.equal(clockLabel(new Date('2026-11-01T10:30:00Z'), 'America/Los_Angeles', 'en'), 'LOS ANGELES · 02:30');
if (bookingConfig.enabled) assert.ok(calendarUrl(bookingConfig), 'An enabled site requires a valid, verified booking path');
for (const name of ['index.html','styles.css','app.js','config.js','booking-utils.js']) {
  const text = await readFile(new URL('./'+name, import.meta.url), 'utf8');
  assert.ok(!/https:\/\/[^\s"']*dida365\.com\/.*(?:token|ical|calendar)/i.test(text), 'Private task feed must not be published');
  assert.ok(!/cal_live_|AIza[0-9A-Za-z_-]{20,}/.test(text), 'No API credentials in public assets');
}
console.log('Checks passed: safe booking configuration, LA daylight saving time, public asset secret checks.');
