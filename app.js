import { bookingConfig } from './config.js';
import { calendarUrl, clockLabel } from './booking-utils.js';

const translations = {
  en: {
    skip: 'Skip to booking', eyebrow: 'A LITTLE TIME, A GOOD CONVERSATION', heading: 'Let’s find<br>a good time.',
    intro: 'A quick introduction, a fresh idea, or a longer conversation. Pick a time that works for you.',
    daysLabel: 'Days', days: 'Every day', hoursLabel: 'Hours', zoneLabel: 'Time zone', zone: 'Los Angeles',
    hostNote: 'Your time matters.<br>Let’s make it a good conversation.', step: 'BOOK A CONVERSATION', schedulerTitle: 'Make some time.',
    notOpen: 'Opening soon', live: 'Book a time', schedulerDescription: 'Choose your duration and a time, then tell me a little about yourself.',
    emptyTitle: 'Good conversations are on the way.', emptyBody: 'Online bookings aren’t open yet. Please check back soon to find an available time.', emptyCaption: 'No appointment has been made.',
    privacy: 'Only available times are shared. Calendar and task details stay private.', how1: 'Choose a duration', how2: 'Find your time', how3: 'Get a calendar invite',
    footer: 'A little less back-and-forth. A little more connection.', loading: 'Loading available times…', frameTitle: 'Select a time and book a conversation with Justin Lu',
    embedHelp: 'Calendar not showing?', reload: 'Try again', openCalendar: 'Open booking page ↗', timeout: 'The calendar is taking a little longer to load. You can retry or open the booking page directly.',
  },
  zh: {
    skip: '前往预约', eyebrow: '留一点时间，聊一些有意思的事', heading: '找个时间，<br>好好聊聊。',
    intro: '一次认识、一个新想法，或一场深入的交流。选一个适合你的时间，我们聊聊。',
    daysLabel: '开放日期', days: '每天', hoursLabel: '预约时段', zoneLabel: '所在时区', zone: '洛杉矶',
    hostNote: '珍惜每一次相遇，<br>期待与你的交流。', step: '预约一次交流', schedulerTitle: '为交流留一点时间。',
    notOpen: '即将开放', live: '选择时间', schedulerDescription: '选择预约时长和时间，再介绍一下你自己。',
    emptyTitle: '下一次交流，值得期待。', emptyBody: '在线预约尚未开放。请稍后回来查看可预约的时间。', emptyCaption: '目前尚未创建任何预约。',
    privacy: '这里只展示可预约时间，不公开日历事件或任务内容。', how1: '选择预约时长', how2: '找到合适时间', how3: '收到日历邀请',
    footer: '少一些来回确认，多一点真正的交流。', loading: '正在读取可预约时间…', frameTitle: '选择时间并预约与 Justin Lu 的交流',
    embedHelp: '日历未显示？', reload: '重新加载', openCalendar: '打开预约页面 ↗', timeout: '日历加载时间稍长。你可以重试，或直接打开预约页面。',
  },
};

let language = bookingConfig.defaultLanguage === 'zh' ? 'zh' : 'en';
try {
  const saved = localStorage.getItem('booking-language');
  if (saved === 'en' || saved === 'zh') language = saved;
} catch { /* Browsing with storage disabled is supported. */ }
let currentFrame;
let loadTimer;
let enabled = false;
const mount = document.querySelector('#booking-mount');
const languageButton = document.querySelector('#language-button');
const t = (key) => translations[language][key];

function applyLanguage() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = language === 'zh' ? '预约与 Justin 的交流' : 'Time with Justin';
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    // The only HTML comes from this fixed translation table, never visitor input.
    if (key === 'heading' || key === 'hostNote') element.innerHTML = t(key);
    else element.textContent = t(key);
  });
  languageButton.textContent = language === 'en' ? '中文 ↗' : 'English ↗';
  languageButton.setAttribute('aria-label', language === 'en' ? '切换为中文' : 'Switch to English');
  if (enabled) document.querySelector('#status-chip span:last-child').textContent = t('live');
  if (currentFrame) currentFrame.title = t('frameTitle');
  updateClock();
}

function updateClock() {
  try {
    document.querySelector('#host-clock').textContent = clockLabel(new Date(), bookingConfig.hostTimeZone, language);
  } catch { document.querySelector('#host-clock').textContent = 'Los Angeles'; }
}

function mountBooking() {
  clearTimeout(loadTimer);
  const url = calendarUrl(bookingConfig);
  if (!url) return; // Never expose guessed availability while connections are incomplete.
  enabled = true;
  mount.replaceChildren();
  mount.setAttribute('aria-busy', 'true');
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.dataset.i18n = 'loading';
  loader.textContent = t('loading');
  const warning = document.createElement('p');
  warning.className = 'error-note';
  warning.dataset.i18n = 'timeout';
  warning.textContent = t('timeout');
  warning.hidden = true;
  const frame = document.createElement('iframe');
  frame.className = 'embed-frame is-loading';
  frame.title = t('frameTitle');
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.src = url.toString();
  frame.addEventListener('load', () => {
    if (currentFrame !== frame) return;
    clearTimeout(loadTimer);
    loader.remove();
    warning.hidden = true;
    frame.classList.remove('is-loading');
    frame.classList.add('is-ready');
    mount.setAttribute('aria-busy', 'false');
    // A frame load is not a booking confirmation. Cal.com owns the entire booking flow.
  });
  currentFrame = frame;
  mount.append(loader, warning, frame);
  document.querySelector('#status-chip').classList.add('is-open');
  document.querySelector('#status-chip span:last-child').textContent = t('live');
  document.querySelector('#embed-help').hidden = false;
  const directUrl = new URL(url);
  directUrl.search = '';
  document.querySelector('#external-booking').href = directUrl.toString();
  loadTimer = setTimeout(() => {
    if (currentFrame !== frame) return;
    loader.remove();
    warning.hidden = false;
    frame.classList.remove('is-loading');
    frame.classList.add('has-warning');
    mount.setAttribute('aria-busy', 'false');
  }, 15000);
}

languageButton.addEventListener('click', () => {
  language = language === 'en' ? 'zh' : 'en';
  try { localStorage.setItem('booking-language', language); } catch { /* Optional preference. */ }
  applyLanguage();
  // Keep the iframe mounted so a language toggle never discards a booking form.
});
document.querySelector('#retry-button').addEventListener('click', mountBooking);
document.querySelector('#year').textContent = String(new Date().getFullYear());
applyLanguage();
mountBooking();
setInterval(updateClock, 60000);
