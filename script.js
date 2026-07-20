const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.global-nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.day-tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.day-tab').forEach(item => {
    item.classList.remove('active');
    item.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.timeline').forEach(item => item.classList.add('hidden'));
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  document.getElementById(tab.dataset.day).classList.remove('hidden');
}));

const festivalStart = new Date('2026-11-20T09:30:00+09:00');
function updateCountdown() {
  const remaining = festivalStart - new Date();
  const status = document.getElementById('countdown-status');
  if (remaining <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(id => document.getElementById(id).textContent = '00');
    status.textContent = 'NOW OPEN';
    return;
  }
  const seconds = Math.floor(remaining / 1000);
  document.getElementById('days').textContent = String(Math.floor(seconds / 86400)).padStart(3, '0');
  document.getElementById('hours').textContent = String(Math.floor(seconds % 86400 / 3600)).padStart(2, '0');
  document.getElementById('minutes').textContent = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds % 60).padStart(2, '0');
}
updateCountdown(); setInterval(updateCountdown, 1000);

let weekOffset = 0;
const sampleEvents = {
  '2026-07-20': [{title:'実行委員会定例会', type:''}],
  '2026-07-22': [{title:'企画書締切', type:'light'}],
  '2026-07-24': [{title:'広報ミーティング', type:''}],
  '2026-07-25': [{title:'会場下見', type:'light'}]
};
function renderWeek() {
  const calendar = document.getElementById('week-calendar');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const weekdays = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  calendar.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday); date.setDate(monday.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    const day = document.createElement('div');
    day.className = 'calendar-day' + (date.getTime() === today.getTime() ? ' today' : '');
    day.innerHTML = `<time>${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')} <small>${weekdays[i]}</small></time>`;
    (sampleEvents[key] || []).forEach(event => { const item = document.createElement('span'); item.className = `calendar-event ${event.type}`; item.textContent = event.title; day.appendChild(item); });
    calendar.appendChild(day);
  }
}
document.getElementById('prev-week').addEventListener('click', () => { weekOffset--; renderWeek(); });
document.getElementById('next-week').addEventListener('click', () => { weekOffset++; renderWeek(); });
renderWeek();

// Add the week / month switch without changing the calendar's public markup.
let calendarView = 'week';
let calendarCursor = new Date();
calendarCursor.setHours(0, 0, 0, 0);
const calendar = document.getElementById('week-calendar');
const calendarHeading = document.querySelector('.week-head h2');
const previousButton = document.getElementById('prev-week');
const nextButton = document.getElementById('next-week');
const viewSwitch = document.createElement('div');
viewSwitch.className = 'view-switch';
viewSwitch.innerHTML = '<button class="view-button active" type="button">週</button><button class="view-button" type="button">月</button>';
previousButton.before(viewSwitch);
const [weekButton, monthButton] = viewSwitch.querySelectorAll('button');
const weekdayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
function dateKey(date) { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); }
function addDay(date, outside = false) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = document.createElement('div');
  day.className = 'calendar-day' + (date.getTime() === today.getTime() ? ' today' : '') + (outside ? ' outside-day' : '');
  day.innerHTML = `<time>${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} <small>${weekdayLabels[date.getDay()]}</small></time>`;
  (sampleEvents[dateKey(date)] || []).forEach(event => { const item = document.createElement('span'); item.className = `calendar-event ${event.type}`; item.textContent = event.title; day.appendChild(item); });
  calendar.appendChild(day);
}
function renderCalendarView() {
  calendar.innerHTML = '';
  if (calendarView === 'week') {
    const monday = new Date(calendarCursor); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) { const date = new Date(monday); date.setDate(monday.getDate() + i); addDay(date); }
    calendarHeading.textContent = '今週の予定';
  } else {
    const first = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    for (let i = 0; i < 42; i++) { const date = new Date(start); date.setDate(start.getDate() + i); addDay(date, date.getMonth() !== first.getMonth()); }
    calendarHeading.textContent = `${first.getFullYear()}年${first.getMonth() + 1}月`;
  }
}
function selectCalendarView(view) { calendarView = view; weekButton.classList.toggle('active', view === 'week'); monthButton.classList.toggle('active', view === 'month'); renderCalendarView(); }
weekButton.addEventListener('click', () => selectCalendarView('week'));
monthButton.addEventListener('click', () => selectCalendarView('month'));
previousButton.addEventListener('click', () => { calendarCursor.setDate(calendarCursor.getDate() - (calendarView === 'week' ? 7 : 30)); renderCalendarView(); });
nextButton.addEventListener('click', () => { calendarCursor.setDate(calendarCursor.getDate() + (calendarView === 'week' ? 7 : 30)); renderCalendarView(); });
renderCalendarView();

// Public festival calendar. Changes made in Google Calendar are reflected automatically.
const publicCalendarFrame = document.createElement('iframe');
publicCalendarFrame.className = 'google-calendar-embed';
publicCalendarFrame.title = '第27回 教育学部祭 カレンダー';
publicCalendarFrame.loading = 'lazy';
publicCalendarFrame.src = 'https://calendar.google.com/calendar/embed?src=38ec9a8d98027b83dc07dbe8e8e86960c1af323771e1873ac47b65bd15bb72e1%40group.calendar.google.com&ctz=Asia%2FTokyo&mode=MONTH&showTitle=0&showPrint=0&showTabs=1&showCalendars=0';
calendar.style.display = 'none';
viewSwitch.style.display = 'none';
previousButton.style.display = 'none';
nextButton.style.display = 'none';
calendar.after(publicCalendarFrame);
const embedNote = document.createElement('p');
embedNote.className = 'calendar-embed-note';
embedNote.textContent = '予定の追加・変更は Google カレンダー側で行うと自動で反映されます。';
publicCalendarFrame.after(embedNote);

// Render the public Google Calendar with department-specific event colours.
const calendarApiKey = 'AIzaSyBIdsYJ_QWW_T9T7wa7BLCysqkgB0KzYPE';
const festivalCalendarId = '38ec9a8d98027b83dc07dbe8e8e86960c1af323771e1873ac47b65bd15bb72e1@group.calendar.google.com';
const activeCalendarApiKey = 'AIzaSyDvgGgynG7JCCDiNDI21zq7VA4axhxk-1w';
const departmentColours = {
  'いざかや': '#f3c6c2', 'いちにかい': '#cbe5a1', 'SE': '#83d7d3', 'MM': '#c7c7c7',
  '経理': '#f8dd72', '工房': '#f6c0d5', '渉外': '#d9c9ec', 'ステージ': '#f8b166'
};
function localDateKey(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}
function calendarBounds() {
  if (calendarView === 'week') {
    const start = new Date(calendarCursor); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start); end.setDate(end.getDate() + 7);
    return { start, end, count: 7, first: start };
  }
  const first = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const start = new Date(first); start.setDate(1 - first.getDay());
  const end = new Date(start); end.setDate(end.getDate() + 42);
  return { start, end, count: 42, first };
}
function eventDayKey(event) {
  if (event.start.date) return event.start.date;
  return localDateKey(new Date(event.start.dateTime));
}
function eventDateKeys(event) {
  const start = event.start.date ? new Date(`${event.start.date}T00:00:00`) : new Date(event.start.dateTime);
  const end = event.end?.date ? new Date(`${event.end.date}T00:00:00`) : new Date(event.end?.dateTime || event.start.dateTime);
  const first = new Date(start); first.setHours(0, 0, 0, 0);
  const last = new Date(end); last.setHours(0, 0, 0, 0);
  // All-day events use an exclusive end date. Timed events ending at midnight do too.
  if (event.end?.date || (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0)) last.setDate(last.getDate() - 1);
  if (last < first) last.setTime(first.getTime());
  const keys = [];
  for (const date = new Date(first); date <= last; date.setDate(date.getDate() + 1)) keys.push(localDateKey(date));
  return keys;
}
function departmentColour(summary) {
  const matchedDepartment = summary.match(/(いざかや|いちにかい|SE|MM|経理|工房|渉外|ステージ)/);
  if (matchedDepartment) return departmentColours[matchedDepartment[1]];
  if (summary.includes('事前企画')) return '#b7125a';
  if (summary.includes('山の日')) return '#0b8043';
  return '#333333';
}
function readableTextColour(colour) {
  const hex = String(colour).replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#ffffff';
  const red = parseInt(hex.slice(0, 2), 16), green = parseInt(hex.slice(2, 4), 16), blue = parseInt(hex.slice(4, 6), 16);
  return (red * 0.299 + green * 0.587 + blue * 0.114) > 175 ? '#111111' : '#ffffff';
}
async function renderDepartmentCalendar() {
  publicCalendarFrame.remove(); embedNote.remove();
  calendar.style.display = ''; viewSwitch.style.display = ''; previousButton.style.display = ''; nextButton.style.display = '';
  const bounds = calendarBounds();
  calendar.classList.toggle('month-view', calendarView === 'month');
  calendar.innerHTML = '<p class="calendar-loading">予定を読み込んでいます…</p>';
  calendarHeading.textContent = calendarView === 'week' ? '今週の予定' : `${bounds.first.getFullYear()}年${bounds.first.getMonth() + 1}月`;
  try {
    const params = new URLSearchParams({ key: activeCalendarApiKey, singleEvents: 'true', orderBy: 'startTime', timeMin: bounds.start.toISOString(), timeMax: bounds.end.toISOString(), maxResults: '2500', timeZone: 'Asia/Tokyo', eventLabelVersion: '1' });
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(festivalCalendarId)}/events?${params}`);
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}${detail?.error?.message ? `: ${detail.error.message}` : ''}`);
    }
    const { items = [] } = await response.json();
    const [coloursResponse, calendarDetailsResponse] = await Promise.all([
      fetch(`https://www.googleapis.com/calendar/v3/colors?key=${activeCalendarApiKey}`),
      fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(festivalCalendarId)}?key=${activeCalendarApiKey}&eventLabelVersion=1`)
    ]);
    const googleEventColours = coloursResponse.ok ? ((await coloursResponse.json()).event || {}) : {};
    const calendarDetails = calendarDetailsResponse.ok ? await calendarDetailsResponse.json() : {};
    const googleEventLabels = Object.fromEntries((calendarDetails.labelProperties?.eventLabels || []).map(label => [label.id, label.backgroundColor]));
    const eventsByDate = items.reduce((list, event) => { eventDateKeys(event).forEach(key => (list[key] ||= []).push(event)); return list; }, {});
    calendar.innerHTML = '';
    for (let i = 0; i < bounds.count; i++) {
      const date = new Date(bounds.start); date.setDate(bounds.start.getDate() + i);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const day = document.createElement('div');
      day.className = 'calendar-day' + (date.getTime() === today.getTime() ? ' today' : '') + (calendarView === 'month' && date.getMonth() !== bounds.first.getMonth() ? ' outside-day' : '');
      day.innerHTML = `<time>${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} <small>${weekdayLabels[date.getDay()]}</small></time>`;
      (eventsByDate[localDateKey(date)] || []).forEach(event => {
        const item = document.createElement('span');
        const labelColour = event.eventLabelId && googleEventLabels[event.eventLabelId];
        const googleColour = event.colorId && googleEventColours[event.colorId]?.background;
        const colour = labelColour || googleColour || departmentColour(event.summary || '');
        item.className = 'calendar-event'; item.textContent = event.summary || '（タイトルなし）'; item.tabIndex = 0; item.setAttribute('role', 'button'); item.setAttribute('aria-label', `${event.summary || '予定'}の詳細を表示`);
        item.style.backgroundColor = colour; item.style.borderLeftColor = colour; item.style.color = readableTextColour(colour);
        item.addEventListener('click', () => openEventModal(event, colour));
        item.addEventListener('keydown', keyboardEvent => { if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') { keyboardEvent.preventDefault(); openEventModal(event, colour); } });
        day.appendChild(item);
      });
      calendar.appendChild(day);
    }
  } catch (error) {
    calendar.innerHTML = `<p class="calendar-event-error">予定を読み込めませんでした。${error.message}<br>公開URLで開いているか、Google CloudのAPIキーが「Google Calendar API」とこのサイトのURLに制限されているか確認してください。</p>`;
  }
}
weekButton.addEventListener('click', () => setTimeout(renderDepartmentCalendar, 0));
monthButton.addEventListener('click', () => setTimeout(renderDepartmentCalendar, 0));
previousButton.addEventListener('click', () => setTimeout(renderDepartmentCalendar, 0));
nextButton.addEventListener('click', () => setTimeout(renderDepartmentCalendar, 0));
renderDepartmentCalendar();

// Load announcements from a Google Sheets CSV published to the web.
// Columns: 公開 / 日付 / 種類 / 見出し / リンク
const newsSection = document.getElementById('news');
const newsList = newsSection?.querySelector('.news-list');
const newsStatus = document.getElementById('news-status');

function parseCsv(csv) {
  const rows = [];
  let row = [], value = '', quoted = false;
  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') { value += '"'; index++; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') { row.push(value); value = ''; }
    else if (character === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = ''; }
    else value += character;
  }
  if (value || row.length) { row.push(value.replace(/\r$/, '')); rows.push(row); }
  return rows;
}

function formatNewsDate(value) {
  const text = String(value || '').trim();
  const matched = text.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);
  if (matched) return `${matched[1]}.${matched[2].padStart(2, '0')}.${matched[3].padStart(2, '0')}`;
  const monthAndDay = text.match(/^(\d{1,2})[\/.\-](\d{1,2})$/);
  return monthAndDay ? `${new Date().getFullYear()}.${monthAndDay[1].padStart(2, '0')}.${monthAndDay[2].padStart(2, '0')}` : text;
}

function newsDateValue(value) {
  let normalized = String(value || '').trim().replace(/[.\/]/g, '-');
  if (/^\d{1,2}-\d{1,2}$/.test(normalized)) normalized = `${new Date().getFullYear()}-${normalized}`;
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function googleSheetCsvUrl(value) {
  const url = new URL(value, window.location.href);
  const sheetMatch = url.pathname.match(/^\/spreadsheets\/d\/([^/]+)/);
  if (!sheetMatch || url.searchParams.get('output') === 'csv' || url.searchParams.get('format') === 'csv') return url.href;
  const hashParameters = new URLSearchParams(url.hash.replace(/^#/, ''));
  const gid = url.searchParams.get('gid') || hashParameters.get('gid') || '0';
  return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv&gid=${encodeURIComponent(gid)}`;
}

function renderSheetNews(items) {
  if (!newsList || !items.length) return;
  const fragment = document.createDocumentFragment();
  items.forEach(item => {
    const link = document.createElement('a');
    const safeLink = /^(https?:\/\/|#)/i.test(item.link || '') ? item.link : '#news';
    link.href = safeLink;
    if (/^https?:\/\//i.test(item.link)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    const time = document.createElement('time');
    time.textContent = formatNewsDate(item.date);
    const tag = document.createElement('span');
    tag.className = 'tag'; tag.textContent = item.category || 'お知らせ';
    const departmentColour = departmentColours[String(item.category || '').trim()];
    if (departmentColour) {
      tag.style.backgroundColor = departmentColour;
      tag.style.borderColor = departmentColour;
      tag.style.color = readableTextColour(departmentColour);
    }
    const title = document.createElement('p');
    title.textContent = item.title;
    const arrow = document.createElement('i');
    arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true');
    link.append(time, tag, title, arrow);
    fragment.appendChild(link);
  });
  newsList.replaceChildren(fragment);
}

async function loadSheetNews() {
  if (!newsSection || !newsList || !newsStatus) return;
  const sheetUrl = newsSection.dataset.newsSheetUrl?.trim();
  if (!sheetUrl) return;
  newsList.setAttribute('aria-busy', 'true');
  newsStatus.classList.remove('is-error');
  newsStatus.textContent = 'お知らせを読み込んでいます…';
  try {
    const response = await fetch(googleSheetCsvUrl(sheetUrl), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = parseCsv(await response.text()).filter(row => row.some(cell => cell.trim()));
    const headers = (rows.shift() || []).map(header => header.trim().replace(/^\uFEFF/, ''));
    const column = names => names.map(name => headers.indexOf(name)).find(index => index >= 0) ?? -1;
    const indexes = {
      published: column(['公開', '表示', 'published']), date: column(['日付', 'date']),
      category: column(['種類', 'カテゴリ', '部署', 'category']), title: column(['見出し', 'タイトル', '内容', 'title']),
      link: column(['リンク', 'URL', '詳細', 'url'])
    };
    if (indexes.date < 0 || indexes.title < 0) throw new Error('「日付」と「見出し」の列が必要です');
    const hiddenValues = new Set(['false', '0', 'no', '非公開', '非表示']);
    const items = rows.map(row => ({
      published: indexes.published < 0 ? '' : row[indexes.published], date: row[indexes.date],
      category: indexes.category < 0 ? '' : row[indexes.category], title: row[indexes.title],
      link: indexes.link < 0 ? '' : row[indexes.link]
    })).filter(item => item.title?.trim() && !hiddenValues.has(String(item.published).trim().toLowerCase()))
      .sort((first, second) => newsDateValue(second.date) - newsDateValue(first.date));
    const limit = Math.max(1, Number(newsSection.dataset.newsLimit) || 5);
    if (!items.length) throw new Error('表示できるお知らせがありません');
    renderSheetNews(items.slice(0, limit));
    newsStatus.textContent = '';
  } catch (error) {
    newsStatus.classList.add('is-error');
    newsStatus.textContent = '最新情報を取得できなかったため、保存済みのお知らせを表示しています。';
    console.error('News spreadsheet:', error);
  } finally {
    newsList.removeAttribute('aria-busy');
  }
}

loadSheetNews();

// Show the nearest upcoming Google Calendar event in Today's Topic.
document.querySelector('.calendar-note')?.remove();
const topicPanel = document.querySelector('.todays-topic');
const topicTitle = topicPanel?.querySelector('h2');
const topicLink = topicPanel?.querySelector('a');
const topicDate = document.createElement('p');
topicDate.className = 'topic-date';
topicTitle?.before(topicDate);
function topicDateText(event) {
  if (event.start.date) return new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${event.start.date}T00:00:00`));
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(event.start.dateTime));
}
async function updateTodaysTopic() {
  if (!topicPanel || !topicTitle || !topicLink) return;
  try {
    const params = new URLSearchParams({ key: activeCalendarApiKey, singleEvents: 'true', orderBy: 'startTime', timeMin: new Date().toISOString(), maxResults: '1', timeZone: 'Asia/Tokyo', eventLabelVersion: '1' });
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(festivalCalendarId)}/events?${params}`);
    const { items = [] } = await response.json();
    const event = items[0];
    if (!event) {
      topicDate.textContent = 'NEXT EVENT'; topicTitle.textContent = '次の予定は、<br>まもなく公開。'; topicLink.textContent = 'カレンダーを見る →'; topicLink.href = '#schedule'; return;
    }
    topicDate.textContent = topicDateText(event);
    topicTitle.textContent = event.summary || '（タイトルなし）';
    topicLink.textContent = '予定の詳細を見る →';
    topicLink.href = '#schedule';
    topicLink.onclick = clickEvent => { clickEvent.preventDefault(); openEventModal(event, departmentColour(event.summary || '')); };
  } catch {
    topicDate.textContent = 'TODAY\'S TOPIC'; topicTitle.textContent = '予定を読み込み中です。';
  }
}
updateTodaysTopic();

// Simple shared-code gate. For a production access restriction, validate this server-side.
const accessGate = document.getElementById('access-gate');
const accessForm = document.getElementById('access-form');
const accessInput = document.getElementById('access-code');
const accessError = document.getElementById('access-error');
const loginStorageKey = 'educationFestivalAccessUntil';
const loginDuration = 14 * 24 * 60 * 60 * 1000;
function hasActiveLogin() { return Number(localStorage.getItem(loginStorageKey)) > Date.now(); }
function openFestivalSite() { accessGate.hidden = true; document.body.style.overflow = ''; }
if (hasActiveLogin()) { openFestivalSite(); } else { document.body.style.overflow = 'hidden'; accessInput.focus(); }
accessForm.addEventListener('submit', event => {
  event.preventDefault();
  if (accessInput.value === '0200') {
    localStorage.setItem(loginStorageKey, String(Date.now() + loginDuration));
    openFestivalSite();
  } else {
    accessError.textContent = 'パスワードが違います。もう一度確認してください。';
    accessInput.select();
  }
});
const eventModal = document.createElement('section');
eventModal.className = 'event-modal';
eventModal.hidden = true;
eventModal.setAttribute('role', 'dialog');
eventModal.setAttribute('aria-modal', 'true');
document.body.appendChild(eventModal);
function eventDateTimeText(event) {
  const format = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' });
  if (event.start.date) {
    const start = new Date(`${event.start.date}T00:00:00`);
    const end = new Date(`${event.end?.date || event.start.date}T00:00:00`);
    end.setDate(end.getDate() - 1);
    const startText = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(start);
    const endText = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(end);
    return startText === endText ? `${startText}（終日）` : `${startText} 〜 ${endText}（終日）`;
  }
  const start = format.format(new Date(event.start.dateTime));
  const end = format.format(new Date(event.end?.dateTime || event.start.dateTime));
  return `${start} 〜 ${end}`;
}
function addModalDetail(container, label, content, className = '') {
  if (!content) return;
  const detail = document.createElement('div'); detail.className = `event-modal-detail ${className}`;
  const heading = document.createElement('strong'); heading.textContent = label;
  const value = document.createElement('div'); value.textContent = content;
  detail.append(heading, value); container.appendChild(detail);
}
function closeEventModal() { eventModal.hidden = true; document.body.style.overflow = ''; }
function openEventModal(event, colour) {
  eventModal.innerHTML = '';
  const card = document.createElement('div'); card.className = 'event-modal-card'; card.style.borderTopColor = colour;
  const close = document.createElement('button'); close.className = 'event-modal-close'; close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', '閉じる'); close.addEventListener('click', closeEventModal);
  const label = document.createElement('p'); label.className = 'event-modal-label'; label.textContent = 'SCHEDULE DETAIL';
  const title = document.createElement('h3'); title.className = 'event-modal-title'; title.textContent = event.summary || '（タイトルなし）';
  card.append(close, label, title);
  addModalDetail(card, 'DATE & TIME', eventDateTimeText(event));
  addModalDetail(card, 'LOCATION', event.location);
  addModalDetail(card, 'DETAIL', event.description, 'event-modal-description');
  if (event.htmlLink) { const link = document.createElement('a'); link.className = 'event-modal-link'; link.href = event.htmlLink; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = 'Google カレンダーで開く →'; card.appendChild(link); }
  eventModal.appendChild(card); eventModal.hidden = false; document.body.style.overflow = 'hidden'; close.focus();
}
eventModal.addEventListener('click', event => { if (event.target === eventModal) closeEventModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !eventModal.hidden) closeEventModal(); });
const portalLinkContainer = document.querySelector('.department-links');
if (portalLinkContainer) {
  const portalSections = [
    { title: '企画特設ページ', links: [['夏祭り', '8/11', 'https://hyuga2026-tech.github.io/Summer-P-fes-2026/'], ['24時間テレビ', '9/26–27'], ['コンパ', '10/5'], ['決起集会', '11/11'], ['古本市', '']] },
    { title: '便利機能', links: [['シフト', ''], ['各種マニュアル', ''], ['マップ', '']] },
    { title: 'What’s 学部祭？', links: [['テーマ・テーマソングについて', ''], ['インタビュー', ''], ['意気込みボード', '']] },
    { title: '遊び', links: [['デジタル自由帳', ''], ['ゲーム', '']] }
  ];
  const portal = document.createElement('section');
  portal.className = 'portal-links'; portal.setAttribute('aria-label', '学部祭ポータルリンク');
  const heading = document.createElement('p'); heading.textContent = 'FESTIVAL PORTAL'; portal.appendChild(heading);
  const groups = document.createElement('div'); groups.className = 'portal-groups';
  portalSections.forEach((section, index) => {
    const group = document.createElement('div'); group.className = `portal-group portal-group--${['special', 'utility', 'about', 'play'][index]}`;
    const title = document.createElement('h3'); title.textContent = section.title; group.appendChild(title);
    section.links.forEach(([label, date, url]) => {
      const link = document.createElement('a'); link.href = url || `#${label.replace(/[^a-zA-Z0-9]/g, '') || 'page'}`;
      if (url) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${label}の特設ページを新しいタブで開く`);
      }
      const text = document.createElement('span'); text.textContent = date ? `${label}（${date}）` : label;
      const arrow = document.createElement('span'); arrow.textContent = '→';
      link.append(text, arrow); group.appendChild(link);
    });
    groups.appendChild(group);
  });
  portal.appendChild(groups); portalLinkContainer.after(portal);
  const newsBlock = document.querySelector('.news');
  const aboutGroup = groups.querySelector('.portal-group--about');
  if (newsBlock && aboutGroup) groups.insertBefore(newsBlock, aboutGroup);
}
