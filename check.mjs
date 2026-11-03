import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DURATIONS, dateKey, dayBounds, timeLabel, normalizeSlots, mergeRanges} from './booking-utils.js';
import config from './config.js';
assert.deepEqual(DURATIONS,[30,45,60,120]);
const la='America/Los_Angeles';
assert.equal(dayBounds('2026-11-01',la).end-dayBounds('2026-11-01',la).start,25*3600000);
assert.equal(dayBounds('2027-03-14',la).end-dayBounds('2027-03-14',la).start,23*3600000);
assert.equal(new Date(dayBounds('2026-10-30','Asia/Shanghai').start).toISOString(),'2026-10-29T16:00:00.000Z');
assert.equal(dateKey('2026-10-30T17:00:00Z','Asia/Shanghai'),'2026-10-31');
assert.equal(timeLabel('2026-10-30T20:30:00Z',la,'en'),'1:30 PM');
assert.equal(timeLabel('2026-10-30T20:30:00Z',la,'zh'),'下午1:30');
assert.equal(timeLabel('2026-10-30T07:00:00Z',la,'zh'),'上午12:00');
const bounds={start:0,end:300000};
assert.deepEqual(mergeRanges([{start:60000,end:120000},{start:0,end:60000},{start:180000,end:360000}],bounds),[{start:0,end:120000},{start:180000,end:300000}]);
const raw={'1970-01-01':[{start:'1970-01-01T00:01Z',end:'1970-01-01T00:02Z'},{start:'1970-01-01T00:01Z',end:'1970-01-01T00:02Z'},{start:'1970-01-01T00:05Z',end:'1970-01-01T00:06Z'}]};
assert.deepEqual(normalizeSlots(raw,bounds,1,0),[{start:60000,end:120000}]);
assert.throws(()=>normalizeSlots(raw,bounds,30,0));
assert.throws(()=>normalizeSlots({bad:'not slots'},bounds,1,0));
assert.equal(config.eventTypeId,7703035);
for(const path of ['app.js','booking-utils.js','config.js','justin-availability/index.html','justin-availability/availability.html']) {
 const source=await readFile(new URL(path,import.meta.url),'utf8');
 assert.ok(!/cal_live_|cal_test_|BEGIN PRIVATE KEY|DIDA_FEED_URL|Bearer\s+[a-z0-9]/i.test(source),path+' contains no credentials');
}
console.log('Passed: duration options, 12-hour localization, DST day boundaries, timezone rollover, interval merging, duplicate/boundary filtering, response validation, public configuration.');

const {halfHourlySlots, getSlots} = await import('./booking-utils.js');
const minute=60000, start=Date.parse('2026-11-03T22:00:00Z');
const free=Array.from({length:240},(_,i)=>({start:start+i*minute,end:start+(i+1)*minute}));
const window={start,end:start+240*minute};
for(const duration of DURATIONS){
 const slots=halfHourlySlots(free,window,duration);
 assert.equal(slots[0].start,start);
 assert.equal(slots[1].start,start+30*minute);
 assert.ok(slots.every(s=>s.end-s.start===duration*minute && s.end<=window.end));
}
const gap=free.filter((_,i)=>i!==75);
assert.ok(halfHourlySlots(gap,window,60).every(s=>s.end<=start+75*minute || s.start>=start+76*minute));
assert.equal(halfHourlySlots(free.slice(0,44),window,45).length,0);
assert.equal(halfHourlySlots(free.slice(0,45),window,45).length,1);
assert.ok(halfHourlySlots(free,{start,end:start+60*minute},120).some(s=>s.start===start+30*minute&&s.end>start+60*minute));
assert.equal(halfHourlySlots(free.slice(1),window,60)[0].start,start+30*minute);
assert.equal(halfHourlySlots([],window,60).length,0);
console.log('Passed: half-hour starts, exact durations, busy gaps, short windows, past-start rounding and cross-midnight meetings.');
