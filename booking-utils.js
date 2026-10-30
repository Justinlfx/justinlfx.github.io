/** Public path only. Calendar subscription URLs and credentials must never reach this file. */
export function calendarUrl(config) {
  if (config.enabled !== true || typeof config.calLink !== 'string') return null;
  const path = config.calLink.trim();
  // Exactly one username and event slug; prevent absolute URLs or query injection.
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}\/[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(path)) return null;
  const url = new URL(path, 'https://cal.com/');
  url.searchParams.set('embed', 'true');
  url.searchParams.set('theme', 'light');
  url.searchParams.set('layout', 'month_view');
  return url;
}

export function clockLabel(now, timeZone, language) {
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const time = new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  return `${language === 'zh' ? '洛杉矶' : 'LOS ANGELES'} · ${time}`;
}
