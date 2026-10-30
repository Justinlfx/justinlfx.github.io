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
