export const DURATIONS = Object.freeze([30, 45, 60, 120]);
const dateFormatters = new Map();
export function dateKey(value, timeZone) {
  if (!dateFormatters.has(timeZone)) dateFormatters.set(timeZone, new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }));
  const p = Object.fromEntries(dateFormatters.get(timeZone).formatToParts(new Date(value)).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function addDays(key, days) { return new Date(Date.parse(key + 'T12:00:00Z') + days * 86400000).toISOString().slice(0,10); }
// Find the first instant of this local calendar day; daylight-saving days need not be 24 hours.
export function startOfDay(key, zone) {
  const center = Date.parse(key + 'T00:00:00Z');
  let low = center - 36 * 3600000, high = center + 36 * 3600000;
  while (high - low > 1) { const mid = Math.floor((low + high) / 2); if (dateKey(mid, zone) < key) low = mid; else high = mid; }
  return high;
}
export function dayBounds(key, zone) { return { start: startOfDay(key, zone), end: startOfDay(addDays(key, 1), zone) }; }
export function timeLabel(value, zone, lang) {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { timeZone:zone, hour:'numeric', minute:'2-digit', hourCycle:'h12' }).format(new Date(value));
}
export function gmtOffsetLabel(value, zone) {
  const offset = new Intl.DateTimeFormat('en-US', {timeZone:zone, timeZoneName:'longOffset'}).formatToParts(new Date(value)).find(p => p.type === 'timeZoneName').value;
  return offset === 'GMT' ? 'GMT+00:00' : offset;
}
export function dayLabel(key, lang, options = {}) {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { timeZone:'UTC', month:'long', day:'numeric', weekday:'long', ...options }).format(new Date(key + 'T12:00:00Z'));
}
export function durationLabel(minutes, lang) {
  const hours = Math.floor(minutes / 60), rest = minutes % 60;
  if (lang === 'zh') return [hours ? `${hours} 小时` : '', rest ? `${rest} 分钟` : ''].filter(Boolean).join(' ') || '0 分钟';
  return [hours ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '', rest ? `${rest} min` : ''].filter(Boolean).join(' ') || '0 min';
}
export function normalizeSlots(data, bounds, duration, now = Date.now()) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid availability');
  const seen = new Set(), slots = [];
  for (const day of Object.values(data)) {
    if (!Array.isArray(day)) throw new Error('Invalid availability');
    for (const item of day) {
      const start = Date.parse(item.start), end = Date.parse(item.end);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end - start !== duration * 60000) throw new Error('Invalid slot');
      if (start >= bounds.start && start < bounds.end && start >= now && !seen.has(start)) { slots.push({ start, end }); seen.add(start); }
    }
  }
  return slots.sort((a,b) => a.start - b.start);
}
export function mergeRanges(slots, bounds) {
  const result = [];
  for (const slot of [...slots].sort((a,b) => a.start-b.start)) {
    const start = Math.max(slot.start, bounds.start), end = Math.min(slot.end, bounds.end);
    if (end <= start) continue;
    const last = result.at(-1);
    if (last && start <= last.end) last.end = Math.max(last.end, end);
    else result.push({ start, end });
  }
  return result;
}
export async function getSlots({ eventTypeId, day, zone, duration, signal }) {
  const bounds = dayBounds(day, zone), url = new URL('https://api.cal.com/v2/slots');
  for (const [k,v] of Object.entries({eventTypeId, start:new Date(bounds.start).toISOString(), end:new Date(bounds.end).toISOString(), timeZone:zone, duration, format:'range'})) url.searchParams.set(k,v);
  const response = await fetch(url, {headers:{'cal-api-version':'2024-09-04'}, signal, credentials:'omit'});
  if (!response.ok) throw new Error('Availability unavailable');
  const result = await response.json();
  if (result.status !== 'success') throw new Error('Availability unavailable');
  return normalizeSlots(result.data, bounds, duration);
}
export function bookingLocation(choice, customLocation) {
  if (choice === 'zoom') return {type:'integration', integration:'zoom'};
  if (choice === 'custom' && typeof customLocation === 'string' && customLocation.trim() && customLocation.trim().length <= 500) return {type:'attendeeDefined', location:customLocation.trim()};
  throw new Error('A valid meeting location is required');
}
export async function createBooking({ eventTypeId, slot, duration, zone, lang, fields, location }) {
  if (!DURATIONS.includes(duration) || slot.end-slot.start !== duration*60000) throw new Error('Invalid booking duration');
  const meetingLocation = bookingLocation(location, fields.customLocation);
  const responses = {};
  if (fields.topic?.trim()) responses.title = fields.topic.trim();
  if (fields.notes?.trim()) responses.notes = fields.notes.trim();
  // A submission is never retried automatically: a lost response may still mean the booking was created.
  const response = await fetch('https://api.cal.com/v2/bookings', {
    method:'POST', credentials:'omit', signal:AbortSignal.timeout(45000),
    headers:{'Content-Type':'application/json','cal-api-version':'2026-02-25'},
    body:JSON.stringify({eventTypeId, start:new Date(slot.start).toISOString(), lengthInMinutes:duration,
      attendee:{name:fields.name, email:fields.email, timeZone:zone, language:lang === 'zh' ? 'zh-CN' : 'en'},
      location:meetingLocation, bookingFieldsResponses:responses})
  });
  const result = await response.json();
  if (!response.ok) { const error = new Error('Booking rejected'); error.definite = response.status >= 400 && response.status < 500; throw error; }
  if (result.status !== 'success' || !result.data?.uid || !['accepted','pending'].includes(result.data.status)) throw new Error('Unknown booking result');
  return result.data;
}
