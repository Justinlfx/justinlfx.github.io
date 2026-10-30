import config from './config.js';
import {DURATIONS, dateKey, addDays, dayBounds, timeLabel, dayLabel, durationLabel, mergeRanges, gmtOffsetLabel, getSlots, createBooking} from './booking-utils.js';

const copy = {
  en:{brand:'Justin',bookNav:'Book a time',viewNav:'View availability',switch:'中文',switchLabel:'Switch to Chinese',
    bookingTitle:'Book a meeting',viewTitle:'Availability',
    bookingDescription:'Book a meeting with Justin. Choose a duration, date, time and meeting location.',viewDescription:'View Justin’s available times by date and time zone.',
    privateNote:'Calendar event details are not displayed.',duration:'Duration',zone:'Time zone',calendar:'Select a date',
    prev:'Previous month',next:'Next month',today:'Today',choose:'Choose a start time',free:'Free time',shown:'All times are in',loading:'Checking availability…',
    empty:'No available times.',emptyBook:'No available times for this duration.',another:'Select another date.',failed:'Availability could not be loaded. Please try again.',retry:'Try again',refresh:'Refresh',
    days:['S','M','T','W','T','F','S'],dayNames:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    ranges:n=>`${n} available ${n===1?'period':'periods'}`,total:t=>`${t} available`,minuteNote:'Past times are excluded.',
    chooseHint:'Start times follow your selected meeting length.',back:'Back to times',details:'Booking details',detailsIntro:'A calendar invitation will be sent to your email.',
    name:'Full name',email:'Email address',topic:'Meeting topic',notes:'Notes',optional:'Optional',
    confirm:'Confirm booking',sending:'Confirming booking…',required:'Please complete your name and email.',invalidEmail:'Please enter a valid email address.',
    stale:'This time is no longer available. Please choose another.',rejected:'The booking could not be completed. Refresh the times and try again.',
    unknown:'We couldn’t verify the result. Please check your email before booking again; your request may have succeeded.',
    booked:'Booking confirmed',pending:'Awaiting confirmation',confirmedNote:'Calendar invitation will be sent to',pendingNote:'Confirmation will be emailed to',
    anotherBooking:'Back to calendar',successLabel:'Booking confirmation',location:'Meeting location',zoom:'Zoom',custom:'Custom location',customLabel:'Location or meeting link',locationRequired:'Please enter your custom location or meeting link.',zoomHint:'A Zoom meeting link will be included in your calendar invitation.',openZoom:'Open Zoom meeting',endNext:'next day',
    viewPageTitle:'Justin’s availability',bookPageTitle:'Book a meeting with Justin',
  },
  zh:{brand:'Justin',bookNav:'预约时间',viewNav:'查看空闲时间',switch:'English',switchLabel:'切换为英文',
    bookingTitle:'预约会议',viewTitle:'空闲时间',
    bookingDescription:'预约与 Justin 的会议，选择时长、日期、时间和会议地点。',viewDescription:'按日期和时区查看 Justin 的空闲时间。',
    privateNote:'不展示日历中的事件详情。',duration:'预约时长',zone:'时区',calendar:'选择日期',
    prev:'上个月',next:'下个月',today:'今天',choose:'选择开始时间',free:'空闲时段',shown:'以下时间均为',loading:'正在查询空闲时间…',
    empty:'当天无空闲时段。',emptyBook:'当天无符合所选时长的时段。',another:'请选择其他日期。',failed:'暂时无法读取空闲时间，请重试。',retry:'重试',refresh:'刷新',
    days:['日','一','二','三','四','五','六'],dayNames:['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
    ranges:n=>`${n} 个空闲时段`,total:t=>`共 ${t} 空闲`,minuteNote:'已过去的时段不显示。',
    chooseHint:'开始时间按所选预约时长排列。',back:'返回选择时间',details:'填写预约信息',detailsIntro:'日历邀请将发送到你填写的邮箱。',
    name:'姓名',email:'邮箱地址',topic:'会议主题',notes:'备注',optional:'选填',
    confirm:'确认预约',sending:'正在确认预约…',required:'请填写姓名和邮箱。',invalidEmail:'请填写有效的邮箱地址。',
    stale:'这个时段已不可预约，请重新选择。',rejected:'预约未能完成，请刷新时段后重试。',
    unknown:'暂时无法确认预约结果。请先检查邮箱，再决定是否重新预约；刚才的预约可能已成功。',
    booked:'预约成功',pending:'等待确认',confirmedNote:'日历邀请将发送至',pendingNote:'确认结果将发送至',
    anotherBooking:'返回日历',successLabel:'预约确认',location:'会议地点',zoom:'Zoom',custom:'自定义地点',customLabel:'地点或会议链接',locationRequired:'请填写自定义地点或会议链接。',zoomHint:'日历邀请中将包含 Zoom 会议链接。',openZoom:'打开 Zoom 会议',endNext:'次日',
    viewPageTitle:'Justin 的空闲时间',bookPageTitle:'预约与 Justin 的会议',
  }
};
const zones = [
 ['America/Los_Angeles','US Pacific Time','美西时间'],['America/New_York','US Eastern Time','美东时间'],['Asia/Shanghai','Beijing Time','北京时间'],['America/Chicago','US Central Time','中部时间'],['America/Denver','US Mountain Time','山地时间'],
 ['America/Vancouver','Vancouver','温哥华'],['America/Phoenix','Phoenix','凤凰城'],['America/Toronto','Toronto','多伦多'],['America/Anchorage','Anchorage','安克雷奇'],['Pacific/Honolulu','Honolulu','檀香山'],['America/Mexico_City','Mexico City','墨西哥城'],['America/Sao_Paulo','São Paulo','圣保罗'],
 ['Europe/London','London','伦敦'],['Europe/Paris','Paris','巴黎'],['Europe/Berlin','Berlin','柏林'],['Europe/Helsinki','Helsinki','赫尔辛基'],['Europe/Moscow','Moscow','莫斯科'],['Africa/Johannesburg','Johannesburg','约翰内斯堡'],['Asia/Dubai','Dubai','迪拜'],['Asia/Kolkata','India','印度'],['Asia/Bangkok','Bangkok','曼谷'],['Asia/Hong_Kong','Hong Kong','香港'],['Asia/Taipei','Taipei','台北'],['Asia/Singapore','Singapore','新加坡'],['Asia/Tokyo','Tokyo','东京'],['Asia/Seoul','Seoul','首尔'],['Australia/Perth','Perth','珀斯'],['Australia/Brisbane','Brisbane','布里斯班'],['Australia/Sydney','Sydney','悉尼'],['Australia/Adelaide','Adelaide','阿德莱德'],['Pacific/Auckland','Auckland','奥克兰'],['UTC','UTC','协调世界时']
];
const readOnly = document.body.dataset.page === 'availability';
const params = new URLSearchParams(location.search);
function stored(key) { try{return localStorage.getItem(key);}catch{return null;} }
function remember(key,value) { try{localStorage.setItem(key,value);}catch{} }
let initialZone = stored('justin-time-zone') || Intl.DateTimeFormat().resolvedOptions().timeZone || config.hostTimeZone;
try{new Intl.DateTimeFormat('en',{timeZone:initialZone});}catch{initialZone=config.hostTimeZone;}
const state = {lang:['en','zh'].includes(params.get('lang')) ? params.get('lang') : stored('justin-language') === 'zh' ? 'zh' : config.defaultLanguage,
 zone:initialZone,day:dateKey(Date.now(),initialZone),month:'',duration:30,slots:[],loading:true,error:'',slot:null,submitting:false,result:null,uncertain:false,
 fields:{name:'',email:'',topic:'',notes:'',customLocation:''},location:'zoom',formError:''};
if (initialZone === config.hostTimeZone && Number(new Intl.DateTimeFormat('en',{timeZone:initialZone,hour:'numeric',hourCycle:'h23'}).format(new Date())) >= 22) state.day=addDays(state.day,1);
state.month=state.day.slice(0,7);
const app=document.querySelector('#app'), cache=new Map();
let controller, requestId=0;
const t=()=>copy[state.lang];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=value=>timeLabel(value,state.zone,state.lang);
const dur=value=>durationLabel(value,state.lang);
const offsetCache = new Map();
function zoneLabel(zone=state.zone) {
 const known=zones.find(z=>z[0]===zone);
 const name=known ? known[state.lang==='zh'?2:1] : new Intl.DateTimeFormat(state.lang==='zh'?'zh-CN':'en-US',{timeZone:zone,timeZoneName:'longGeneric'}).formatToParts(new Date()).find(p=>p.type==='timeZoneName')?.value || zone;
 const key=`${zone}|${state.day}`;
 if(!offsetCache.has(key)) {
  const bounds=dayBounds(state.day,zone);
  // Use the selected local day's midpoint, so future dates show their own seasonal offset.
  offsetCache.set(key,gmtOffsetLabel((bounds.start+bounds.end)/2,zone));
 }
 const offset=state.slot && zone===state.zone ? gmtOffsetLabel(state.slot.start,zone) : offsetCache.get(key);
 return `${name} (${offset})`;
}
function rangeLabel(slot) {
 const next=dateKey(slot.end,state.zone)!==dateKey(slot.start,state.zone)?` (${t().endNext})`:'';
 return `${clock(slot.start)} – ${clock(slot.end)}${next}`;
}
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
const lock='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
function calendarHTML() {
 const first=state.month+'-01', offset=new Date(first+'T12:00:00Z').getUTCDay(), count=new Date(Date.UTC(Number(first.slice(0,4)),Number(first.slice(5,7)),0)).getUTCDate(), today=dateKey(Date.now(),state.zone);
 const title=dayLabel(first,state.lang,{month:'long',year:'numeric',day:undefined,weekday:undefined});
 let days='<span class="day-spacer" aria-hidden="true"></span>'.repeat(offset);
 for(let d=1;d<=count;d++) {
  const key=state.month+'-'+String(d).padStart(2,'0'), past=key<today;
  days+=`<button class="day ${key===state.day?'chosen':''} ${key===today?'today':''}" data-day="${key}" ${past?'disabled':''} aria-pressed="${key===state.day}" aria-label="${esc(dayLabel(key,state.lang,{year:'numeric'}))}${key===today?', '+t().today:''}">${d}${key===today?'<i></i>':''}</button>`;
 }
 return `<section class="calendar-panel" aria-label="${t().calendar}"><p class="section-label">${t().calendar}</p><div class="month-bar"><h2>${title}</h2><div class="month-actions"><button class="icon-button prev" data-month="-1" aria-label="${t().prev}" ${state.month<=today.slice(0,7)?'disabled':''}>${arrow}</button><button class="icon-button" data-month="1" aria-label="${t().next}">${arrow}</button></div></div><div class="weekdays">${t().days.map((d,i)=>`<abbr title="${t().dayNames[i]}">${d}</abbr>`).join('')}</div><div class="days">${days}</div><div class="calendar-note"><span class="today-dot"></span>${t().today}</div></section>`;
}
function slotsHTML() {
 let content;
 if(state.loading) content=`<div class="status-block" role="status"><span class="spinner"></span><p>${t().loading}</p></div>`;
 else if(state.error) content=`<div class="status-block error" role="alert"><p>${t().failed}</p><button class="outline" data-refresh>${t().retry}</button></div>`;
 else if(!state.slots.length) content=`<div class="status-block"><span class="empty-mark">—</span><p>${readOnly?t().empty:t().emptyBook}</p><span>${t().another}</span></div>`;
 else if(readOnly) {
  const ranges=mergeRanges(state.slots,dayBounds(state.day,state.zone)), minutes=Math.round(ranges.reduce((n,r)=>n+r.end-r.start,0)/60000);
  content=`<div class="range-summary"><span>${t().ranges(ranges.length)}</span><strong>${t().total(dur(minutes))}</strong></div><div class="ranges">${ranges.map(r=>`<article class="free-range"><span class="range-dot"></span><div><h3>${esc(rangeLabel(r))}</h3><p>${dur(Math.round((r.end-r.start)/60000))}</p></div></article>`).join('')}</div><p class="hint">${t().minuteNote}</p>`;
 } else content=`<div class="slot-grid">${state.slots.map(s=>`<button class="time-slot" data-start="${s.start}" aria-label="${esc(rangeLabel(s))}">${clock(s.start)}${arrow}</button>`).join('')}</div><p class="hint">${t().chooseHint}</p>`;
 return `<section class="times-panel" aria-labelledby="times-title" aria-busy="${state.loading}"><div class="times-heading"><p class="section-label">${readOnly?t().free:t().choose}</p><button class="icon-button refresh" data-refresh aria-label="${t().refresh}" ${state.loading?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M19 11a7 7 0 0 0-12-5L4 9m16 6-3 3A7 7 0 0 1 5 13"/></svg></button></div><h2 id="times-title">${dayLabel(state.day,state.lang)}</h2><p class="zone-caption">${t().shown} ${esc(zoneLabel())}</p><div id="slots" aria-live="polite">${content}</div></section>`;
}
function fieldHTML(name,label,required=false,type='text') {
 return `<label class="field">${label}${required?' <span aria-hidden="true">*</span>':` <small>${t().optional}</small>`}<input name="${name}" type="${type}" value="${esc(state.fields[name])}" ${required?'required':''} autocomplete="${name==='name'?'name':name==='email'?'email':'off'}" maxlength="${name==='topic'?200:name==='customLocation'?500:254}" ${state.submitting?'disabled':''}></label>`;
}
function locationSummary() {
 return state.location==='zoom' ? t().zoom : state.fields.customLocation.trim() || t().custom;
}
function locationHTML() {
 return `<fieldset class="location-field"><legend>${t().location}</legend><div class="location-options"><label class="location-option ${state.location==='zoom'?'chosen':''}"><input type="radio" name="meetingLocation" value="zoom" ${state.location==='zoom'?'checked':''} ${state.submitting?'disabled':''}>${t().zoom}</label><label class="location-option ${state.location==='custom'?'chosen':''}"><input type="radio" name="meetingLocation" value="custom" ${state.location==='custom'?'checked':''} ${state.submitting?'disabled':''}>${t().custom}</label></div>${state.location==='custom'?fieldHTML('customLocation',t().customLabel,true):`<p class="location-hint">${t().zoomHint}</p>`}</fieldset>`;
}
function zoomLinkHTML() {
 if(state.location!=='zoom'||state.result?.status!=='accepted')return '';
 try{
  const url=new URL(state.result.meetingUrl || state.result.location);
  if(url.protocol!=='https:'||!/(^|\.)zoom\.(us|com)$/.test(url.hostname))return '';
  return `<a class="meeting-link" href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${t().openZoom} ↗</a>`;
 }catch{return '';}
}
function detailsHTML() {
 return `<section class="details-panel"><button class="text-button" data-back ${state.submitting?'disabled':''}>← ${t().back}</button><h2 tabindex="-1" id="details-title">${t().details}</h2><p class="muted">${t().detailsIntro}</p><div class="appointment"><span class="appointment-day">${dayLabel(state.day,state.lang,{year:'numeric'})}</span><strong>${esc(rangeLabel(state.slot))}</strong><span>${dur(state.duration)} · ${esc(zoneLabel())} · ${esc(locationSummary())}</span></div><form id="booking-form" novalidate><div class="form-row">${fieldHTML('name',t().name,true)}${fieldHTML('email',t().email,true,'email')}</div>${locationHTML()}${fieldHTML('topic',t().topic)}<label class="field">${t().notes} <small>${t().optional}</small><textarea name="notes" rows="3" maxlength="2000" ${state.submitting?'disabled':''}>${esc(state.fields.notes)}</textarea></label><p class="form-error" role="alert">${state.formError?t()[state.formError]:''}</p><button type="submit" class="primary" ${state.submitting||state.uncertain?'disabled':''}>${state.submitting?'<span class="spinner"></span> '+t().sending:t().confirm}</button></form></section>`;
}
function successHTML() {
 return `<section class="success-panel" aria-label="${t().successLabel}"><div class="success-check">✓</div><h2 tabindex="-1" id="success-title">${state.result.status==='accepted'?t().booked:t().pending}</h2><p>${state.result.status==='accepted'?t().confirmedNote:t().pendingNote}<br><strong>${esc(state.fields.email)}</strong></p><div class="appointment"><span>${dayLabel(state.day,state.lang,{year:'numeric'})}</span><strong>${esc(rangeLabel(state.slot))}</strong><span>${dur(state.duration)} · ${esc(zoneLabel())}</span><span class="meeting-summary">${esc(locationSummary())}</span>${zoomLinkHTML()}</div><button class="outline" data-reset>${t().anotherBooking}</button></section>`;
}
function render() {
 const c=t();document.documentElement.lang=state.lang==='zh'?'zh-CN':'en';document.title=readOnly?c.viewPageTitle:c.bookPageTitle;
 document.querySelector('meta[name="description"]').content=readOnly?c.viewDescription:c.bookingDescription;
 const options=[...zones]; if(!zones.some(z=>z[0]===state.zone))options.push([state.zone]);
 app.innerHTML=`<a class="skip-link" href="#main">${state.lang==='zh'?'跳转到主要内容':'Skip to main content'}</a><div class="page-shell"><header><a class="wordmark" href="./?lang=${state.lang}"><span class="brand-mark" aria-hidden="true">j.</span>${c.brand}</a><div class="header-actions"><nav aria-label="${state.lang==='zh'?'页面导航':'Main navigation'}"><a class="${readOnly?'':'active'}" ${readOnly?'':'aria-current="page"'} href="./?lang=${state.lang}">${c.bookNav}</a><a class="${readOnly?'active':''}" ${readOnly?'aria-current="page"':''} href="./availability.html?lang=${state.lang}">${c.viewNav}</a></nav><button class="language-button" id="language" aria-label="${c.switchLabel}" ${state.submitting?'disabled':''}>${c.switch}</button></div></header><main id="main" class="main-card ${readOnly?'view-mode':''}"><aside class="intro"><div class="intro-top"><div class="avatar" aria-hidden="true">JL<span></span></div><h1>${(readOnly?c.viewTitle:c.bookingTitle).replace('\n','<br>')}</h1></div><div class="intro-bottom"><div class="orbital" aria-hidden="true"><span></span><i></i></div><p>${lock}${c.privateNote}</p></div></aside><div class="workspace">${state.result?successHTML():state.slot?detailsHTML():`<div class="preferences">${readOnly?'':`<div class="duration-control"><p class="section-label">${c.duration}</p><div class="duration-buttons" role="group" aria-label="${c.duration}">${DURATIONS.map(d=>`<button data-duration="${d}" class="${d===state.duration?'selected':''}" aria-pressed="${d===state.duration}">${dur(d)}</button>`).join('')}</div></div>`}<label class="timezone-control"><span class="section-label">${c.zone}</span><select id="timezone">${options.map(z=>`<option value="${z[0]}" ${z[0]===state.zone?'selected':''}>${esc(zoneLabel(z[0]))}</option>`).join('')}</select></label></div><div class="schedule-grid">${calendarHTML()}${slotsHTML()}</div>`}</div></main></div>`;
 bind();
}
function bind() {
 document.querySelector('#language').onclick=()=>{state.lang=state.lang==='en'?'zh':'en';remember('justin-language',state.lang);const u=new URL(location);u.searchParams.set('lang',state.lang);history.replaceState(null,'',u);render();};
 document.querySelector('#timezone')?.addEventListener('change',e=>{state.zone=e.target.value;remember('justin-time-zone',state.zone);if(state.day<dateKey(Date.now(),state.zone))state.day=dateKey(Date.now(),state.zone);state.month=state.day.slice(0,7);loadSlots();});
 document.querySelectorAll('[data-duration]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.duration)===state.duration)return;state.duration=Number(b.dataset.duration);loadSlots();});
 document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{state.day=b.dataset.day;loadSlots();});
 document.querySelectorAll('[data-month]').forEach(b=>b.onclick=()=>{const d=new Date(state.month+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+Number(b.dataset.month));state.month=d.toISOString().slice(0,7);render();});
 document.querySelectorAll('[data-refresh]').forEach(b=>b.onclick=()=>loadSlots(true));
 document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{state.slot=state.slots.find(s=>s.start===Number(b.dataset.start));state.formError='';state.uncertain=false;render();document.querySelector('#details-title')?.focus();});
 document.querySelector('[data-back]')?.addEventListener('click',()=>{state.slot=null;state.formError='';loadSlots(true);});
 document.querySelector('[data-reset]')?.addEventListener('click',()=>{state.result=null;state.slot=null;state.fields={name:'',email:'',topic:'',notes:'',customLocation:''};state.location='zoom';cache.clear();loadSlots(true);});
 const form=document.querySelector('#booking-form');
 form?.addEventListener('input',e=>{if(Object.hasOwn(state.fields,e.target.name))state.fields[e.target.name]=e.target.value;});
 form?.addEventListener('change',e=>{if(e.target.name==='meetingLocation'){state.location=e.target.value;state.formError='';render();if(state.location==='custom')document.querySelector('[name="customLocation"]')?.focus();}});
 form?.addEventListener('submit',submitBooking);
}
async function loadSlots(force=false) {
 const id=++requestId;controller?.abort();controller=new AbortController();
 state.loading=true;state.error='';state.slots=[];render();
 const key=`${state.day}|${state.zone}|${readOnly?1:state.duration}`, entry=cache.get(key);
 try {
  const slots=!force&&entry&&Date.now()-entry.at<30000?entry.slots:await getSlots({eventTypeId:config.eventTypeId,day:state.day,zone:state.zone,duration:readOnly?1:state.duration,signal:AbortSignal.any([controller.signal,AbortSignal.timeout(20000)])});
  if(id!==requestId)return;
  state.slots=slots.filter(s=>s.start>=Date.now());cache.set(key,{at:Date.now(),slots});
 }catch(error){if(id!==requestId)return;state.error='failed';}
 if(id!==requestId)return;
 state.loading=false;render();
}
async function submitBooking(event) {
 event.preventDefault();if(state.submitting||state.uncertain)return;
 for(const key of Object.keys(state.fields))state.fields[key]=state.fields[key].trim();
 if(!state.fields.name||!state.fields.email){state.formError='required';render();return;}
 if(!document.querySelector('[name="email"]').validity.valid){state.formError='invalidEmail';render();return;}
 if(state.location==='custom'&&!state.fields.customLocation){state.formError='locationRequired';render();document.querySelector('[name="customLocation"]')?.focus();return;}
 state.submitting=true;state.formError='';render();
 let checked=false;
 try{
  const latest=await getSlots({eventTypeId:config.eventTypeId,day:state.day,zone:state.zone,duration:state.duration,signal:AbortSignal.timeout(20000)});
  if(!latest.some(s=>s.start===state.slot.start)){state.formError='stale';return;}
  checked=true;
  state.result=await createBooking({eventTypeId:config.eventTypeId,slot:state.slot,duration:state.duration,zone:state.zone,lang:state.lang,fields:state.fields,location:state.location});
  cache.clear();
 }catch(error){state.formError=!checked?'failed':error.definite?'rejected':'unknown';state.uncertain=checked&&!error.definite;}
 finally{state.submitting=false;render();document.querySelector(state.result?'#success-title':'.form-error')?.focus();}
}
render();loadSlots();
