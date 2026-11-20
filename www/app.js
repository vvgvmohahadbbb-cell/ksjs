(() => {
'use strict';
const C = window.CFG || {};
const P = (window.Capacitor && window.Capacitor.Plugins) || {};
const ONLINE = !!C.FB_API_KEY && !/PASTE/.test(C.FB_API_KEY) && !!C.FB_DB_URL && !/PROJECT/.test(C.FB_DB_URL);
const DB = (C.FB_DB_URL || '').replace(/\/$/, '');
const VER = window.APP_VERSION || 0;
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const enc = encodeURIComponent;

const DHIKR = [
  { id: 's', t: 'سبحان الله' }, { id: 'h', t: 'الحمد لله' }, { id: 'a', t: 'الله أكبر' },
  { id: 'l', t: 'لا إله إلا الله' }, { id: 'g', t: 'أستغفر الله' }, { id: 'p', t: 'اللهم صلّ على محمد' }
];
const LEVELS = [[0, 'مبتدئ', '🌱'], [100, 'ذاكر', '🌿'], [1000, 'مداوم', '🌙'], [5000, 'سابق', '⭐'], [20000, 'قنديل', '🏮'], [50000, 'نور', '💎'], [100000, 'أسطورة', '👑']];
const GOALS = [100, 300, 500, 1000];
const KEY = 'tasbeeh_v1';

const defaults = { uid: null, refresh: null, name: '', photo: '', total: 0, counts: {}, day: '', today: 0, goal: 100, streak: 0, best: 0, lastGoalDay: '', dhikr: 's', dirty: true, profDay: '', lastRank: 0, joined: Date.now() };
let S;
try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = Object.assign({}, defaults); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

const dayKey = (t) => new Date((t || Date.now()) + 3 * 36e5).toISOString().slice(0, 10);
const roll = () => { const d = dayKey(); if (S.day !== d) { S.day = d; S.today = 0; } };
const fmt = n => Number(n || 0).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lvl = t => { let i = 0; LEVELS.forEach((l, k) => { if (t >= l[0]) i = k; }); return i; };
const streakNow = () => (S.lastGoalDay && (S.lastGoalDay === dayKey() || S.lastGoalDay === dayKey(Date.now() - 864e5))) ? S.streak : 0;
const avatar = (photo, name) => (typeof photo === 'string' && photo.indexOf('data:image/jpeg;base64,') === 0)
  ? '<img alt="" src="' + photo + '">' : '<span>' + esc((name || '؟').trim().charAt(0) || '؟') + '</span>';

let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
function haptic(strong) {
  try { if (P.Haptics) P.Haptics.impact({ style: strong ? 'HEAVY' : 'LIGHT' }); else if (navigator.vibrate) navigator.vibrate(strong ? 40 : 8); } catch (e) {}
}

/* ---------- render ---------- */
const CIRC = 848.2;
function render() {
  roll();
  const d = DHIKR.find(x => x.id === S.dhikr) || DHIKR[0];
  $('#dh').textContent = d.t;
  $('#cnt').textContent = fmt(S.counts[S.dhikr] || 0);
  $('#ring').style.strokeDashoffset = CIRC * (1 - Math.min(1, S.today / S.goal));
  $('#todayTxt').textContent = fmt(S.today) + ' / ' + fmt(S.goal);
  $('#totalTxt').textContent = fmt(S.total);
  $('#chStreak').textContent = '🔥 ' + streakNow();
  const L = LEVELS[lvl(S.total)];
  $('#chLevel').textContent = L[2] + ' ' + L[1];
  $('#chRank').textContent = '🏆 ' + (S.lastRank ? '#' + fmt(S.lastRank) : '--');
}
function renderDhikrs() {
  $('#dhikrs').innerHTML = DHIKR.map(d => '<button data-id="' + d.id + '" class="' + (d.id === S.dhikr ? 'on' : '') + '">' + d.t + '</button>').join('');
}
function renderMe() {
  $('#avMe').innerHTML = avatar(S.photo, S.name);
  $('#nameIn').value = S.name;
  $('#goals').innerHTML = GOALS.map(g => '<button data-g="' + g + '" class="' + (g === S.goal ? 'on' : '') + '">' + g + '</button>').join('');
  const days = Math.max(1, Math.ceil((Date.now() - S.joined) / 864e5));
  $('#statsCard').innerHTML = '<div class="stats2"><div><b>' + fmt(S.total) + '</b><span class="mut small">المجموع</span></div><div><b>' + streakNow() + '</b><span class="mut small">السلسلة</span></div><div><b>' + S.best + '</b><span class="mut small">أفضل سلسلة</span></div><div><b>' + days + '</b><span class="mut small">يوم معنا</span></div></div>';
  const cur = lvl(S.total);
  $('#badges').innerHTML = LEVELS.map((l, i) => '<div class="badge ' + (i <= cur ? 'on' : '') + '">' + l[2] + ' ' + l[1] + '<div class="mut small">' + fmt(l[0]) + '</div></div>').join('');
  $('#verTxt').textContent = 'النسخة ' + VER;
}

/* ---------- tapping ---------- */
let syncT = null;
function tap() {
  roll();
  const prevLvl = lvl(S.total);
  S.total++; S.today++;
  const c = S.counts[S.dhikr] = (S.counts[S.dhikr] || 0) + 1;
  haptic(c % 33 === 0);
  if (S.today >= S.goal && S.lastGoalDay !== S.day) {
    S.streak = (S.lastGoalDay === dayKey(Date.now() - 864e5)) ? S.streak + 1 : 1;
    S.best = Math.max(S.best, S.streak);
    S.lastGoalDay = S.day;
    toast('🎉 أكملت هدف اليوم! سلسلتك ' + S.streak + ' 🔥');
  } else if (lvl(S.total) > prevLvl) {
    const L = LEVELS[lvl(S.total)];
    toast('⬆️ مستوى جديد: ' + L[2] + ' ' + L[1]);
  } else if (c % 33 === 0) {
    toast('✨ ' + c + ' — ما شاء الله');
  }
  render(); save();
  if (!syncT) syncT = setTimeout(() => { syncT = null; sync(); }, 5000);
}

/* ---------- firebase (REST + anonymous auth) ---------- */
let tok = null, tokExp = 0, syncing = false;
async function auth() {
  if (tok && tokExp > Date.now() + 60000) return;
  let j;
  if (S.refresh) {
    const r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + C.FB_API_KEY, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + enc(S.refresh) });
    j = await r.json();
    if (j.id_token) { tok = j.id_token; tokExp = Date.now() + (+j.expires_in) * 1000; S.uid = j.user_id; save(); return; }
  }
  const r2 = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + C.FB_API_KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
  j = await r2.json();
  if (!j.idToken) throw new Error('auth');
  tok = j.idToken; tokExp = Date.now() + (+j.expiresIn) * 1000; S.refresh = j.refreshToken; S.uid = j.localId; S.dirty = true; save();
}
async function sync() {
  if (!ONLINE || syncing || !S.name) return;
  syncing = true;
  try {
    await auth();
    roll();
    const u = S.uid, d = S.day, up = {};
    up['users/' + u + '/total'] = S.total;
    up['scores/' + u] = S.total;
    up['daily/' + d + '/' + u + '/n'] = S.today;
    if (S.dirty || S.profDay !== d) {
      up['users/' + u + '/name'] = S.name;
      up['users/' + u + '/photo'] = S.photo || '';
      up['daily/' + d + '/' + u + '/name'] = S.name;
      up['daily/' + d + '/' + u + '/p'] = S.photo || '';
    }
    const r = await fetch(DB + '/.json?auth=' + tok, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(up) });
    if (r.ok) { S.dirty = false; S.profDay = d; save(); }
  } catch (e) { /* offline: retry next time */ }
  syncing = false;
}
async function fetchMyRank() {
  if (!ONLINE || !S.uid) return;
  try {
    const r = await fetch(DB + '/scores.json?orderBy=' + enc('"$value"') + '&startAt=' + (S.total + 1) + '&limitToFirst=5000');
    const j = await r.json();
    if (!j || j.error) return;
    const rank = Object.keys(j).filter(k => k !== S.uid).length + 1;
    if (S.lastRank && rank < S.lastRank) toast('🚀 تقدمت ' + (S.lastRank - rank) + ' مراتب!');
    else if (S.lastRank && rank > S.lastRank) toast('😤 ' + (rank - S.lastRank) + ' تخطّوك، كمّل!');
    S.lastRank = rank; save(); render();
  } catch (e) {}
}

/* ---------- leaderboard ---------- */
let boardTab = 'all', boardAll = [];
async function loadBoard(silent) {
  const box = $('#board');
  if (!ONLINE) { box.innerHTML = '<div class="card mut center">الترتيب يحتاج إعداد Firebase في ملف config.js</div>'; $('#myRank').innerHTML = ''; return; }
  if (!silent) box.innerHTML = '<div class="card mut center">جاري التحميل...</div>';
  try {
    await sync();
    const q = boardTab === 'all' ? 'users.json?orderBy=' + enc('"total"') + '&limitToLast=100' : 'daily/' + dayKey() + '.json?orderBy=' + enc('"n"') + '&limitToLast=100';
    const j = await (await fetch(DB + '/' + q)).json();
    if (j && j.error) throw new Error(j.error);
    const rows = Object.entries(j || {}).map(([id, v]) => ({ id, name: v.name || 'بدون اسم', photo: v.photo || v.p || '', n: (boardTab === 'all' ? v.total : v.n) || 0 })).sort((a, b) => b.n - a.n);
    if (boardTab === 'all') boardAll = rows;
    if (boardTab === 'all') { fetchMyRank(); }
    const medals = ['🥇', '🥈', '🥉'];
    box.innerHTML = rows.length ? rows.map((r, i) => '<div class="row ' + (r.id === S.uid ? 'me' : '') + '"><div class="rk">' + (medals[i] || (i + 1)) + '</div><div class="avatar">' + avatar(r.photo, r.name) + '</div><div class="nm">' + esc(r.name) + '</div><div class="n">' + fmt(r.n) + '</div></div>').join('') : '<div class="card mut center">ما في أحد لسا، كن الأول 👑</div>';
    const idx = rows.findIndex(r => r.id === S.uid);
    const mine = boardTab === 'all' ? S.total : S.today;
    $('#myRank').innerHTML = '<div class="center"><b>' + (boardTab === 'all' ? (S.lastRank ? 'ترتيبك #' + fmt(S.lastRank) : '') : (idx >= 0 ? 'ترتيبك اليوم #' + (idx + 1) : 'ترتيبك اليوم خارج أول 100')) + '</b><div class="mut small">' + fmt(mine) + ' تسبيحة</div></div>';
    updateChase();
  } catch (e) { box.innerHTML = '<div class="card mut center">تعذر تحميل الترتيب. تأكد من الإنترنت ومن قواعد Firebase.</div>'; }
}
function updateChase() {
  const el = $('#chase'); const i = boardAll.findIndex(r => r.id === S.uid);
  if (i === 0) el.textContent = '👑 أنت الأول! حافظ على الصدارة';
  else if (i > 0) { const a = boardAll[i - 1]; el.textContent = 'باقي ' + fmt(Math.max(1, a.n - S.total + 1)) + ' وتتخطى ' + a.name; }
  else el.textContent = '';
}

/* ---------- updates (GitHub Releases) ---------- */
let upd = null;
async function checkUpdate() {
  try {
    const r = await fetch('https://api.github.com/repos/' + C.REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) return;
    const j = await r.json();
    const v = parseInt(String(j.tag_name).replace(/\D/g, ''), 10) || 0;
    const a = (j.assets || []).find(x => /\.apk$/i.test(x.name));
    if (v > VER && a) {
      upd = { v, url: a.browser_download_url, size: a.size, notes: (j.body || '').trim() };
      $('#uTitle').textContent = 'تحديث جديد: النسخة ' + v;
      $('#uNotes').textContent = upd.notes.replace('[force]', '').split('\n')[0];
      if (/\[force\]/i.test(upd.notes)) $('#uLater').classList.add('hidden');
      $('#update').classList.remove('hidden');
    }
  } catch (e) {}
}
async function doUpdate() {
  if (!upd) return;
  const FS = P.Filesystem, FO = P.FileOpener;
  if (!FS || !FO) { location.href = upd.url; return; }
  $('#uGo').disabled = true; $('#uLater').classList.add('hidden');
  $('#uBarWrap').classList.remove('hidden'); $('#uInfo').classList.remove('hidden');
  const t0 = Date.now(); let h = null;
  try {
    h = await FS.addListener('progress', e => {
      const total = e.contentLength > 0 ? e.contentLength : upd.size;
      const pct = Math.min(100, Math.round(e.bytes / total * 100));
      const el = (Date.now() - t0) / 1000, speed = e.bytes / Math.max(el, 0.5), left = Math.max(0, (total - e.bytes) / speed);
      $('#uBar').style.width = pct + '%';
      $('#uInfo').textContent = pct + '%  •  باقي ' + ((total - e.bytes) / 1048576).toFixed(1) + ' MB  •  ~' + Math.ceil(left) + ' ثانية';
    });
    const r = await FS.downloadFile({ url: upd.url, path: 'ksjs-update.apk', directory: 'CACHE', progress: true });
    if (h) h.remove();
    $('#uInfo').textContent = 'اكتمل التحميل، اضغط تثبيت';
    await FO.open({ filePath: r.path, contentType: 'application/vnd.android.package-archive', openWithDefault: true });
    $('#uGo').disabled = false;
  } catch (e) {
    try { if (h) h.remove(); } catch (x) {}
    $('#uGo').disabled = false;
    $('#uInfo').textContent = 'تعذر التثبيت داخل التطبيق، سيفتح التحميل من المتصفح';
    setTimeout(() => { location.href = upd.url; }, 1200);
  }
}

/* ---------- daily notifications ---------- */
async function setupNotifs() {
  const L = P.LocalNotifications; if (!L) return;
  try {
    const p = await L.requestPermissions(); if (p.display !== 'granted') return;
    const st = streakNow();
    const list = [
      [1, 5, 30, '🌅 صباح الخير', 'ابدأ يومك بالتسبيح، والترتيب ينتظرك'],
      [2, 13, 0, '📿 تذكير', 'دقيقة تسبيح تبارك يومك'],
      [3, 21, 0, st ? '🔥 سلسلتك ' + st + ' يوم' : '🔥 لا تنسَ تسبيحك اليوم', 'أكمل هدفك قبل ما ينتهي اليوم وحافظ على مرتبتك']
    ];
    await L.schedule({ notifications: list.map(a => ({ id: a[0], title: a[3], body: a[4], schedule: { on: { hour: a[1], minute: a[2] } } })) });
  } catch (e) {}
}

/* ---------- profile ---------- */
function pickPhoto(file) {
  return new Promise(res => {
    if (!file) return res('');
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = 72, c = document.createElement('canvas'); c.width = c.height = s;
      const m = Math.min(img.width, img.height), sx = (img.width - m) / 2, sy = (img.height - m) / 2;
      c.getContext('2d').drawImage(img, sx, sy, m, m, 0, 0, s, s);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => res('');
    img.src = url;
  });
}
function profileChanged() { S.dirty = true; save(); renderMe(); sync(); }

/* ---------- wiring ---------- */
function switchTab(t) {
  $$('.tab').forEach(x => x.classList.toggle('active', x.id === 'tab-' + t));
  $$('nav button').forEach(x => x.classList.toggle('on', x.dataset.tab === t));
  if (t === 'rank') loadBoard(); if (t === 'me') renderMe();
}
function init() {
  roll(); renderDhikrs(); render(); renderMe();
  $('#tap').addEventListener('pointerdown', e => { e.preventDefault(); const b = $('#tap'); b.classList.add('pop'); tap(); setTimeout(() => b.classList.remove('pop'), 90); });
  $('#dhikrs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.dhikr = b.dataset.id; save(); renderDhikrs(); render(); });
  $('#resetCnt').addEventListener('click', () => { S.counts[S.dhikr] = 0; save(); render(); });
  $$('nav button').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $('#segAll').onclick = () => { boardTab = 'all'; $('#segAll').classList.add('on'); $('#segDay').classList.remove('on'); loadBoard(); };
  $('#segDay').onclick = () => { boardTab = 'day'; $('#segDay').classList.add('on'); $('#segAll').classList.remove('on'); loadBoard(); };
  $('#goals').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.goal = +b.dataset.g; save(); renderMe(); render(); });
  $('#nameIn').addEventListener('change', e => { const v = e.target.value.trim().slice(0, 20); if (v) { S.name = v; profileChanged(); } });
  $('#photoIn').addEventListener('change', async e => { S.photo = await pickPhoto(e.target.files[0]); profileChanged(); });
  $('#uGo').onclick = doUpdate;
  $('#uLater').onclick = () => $('#update').classList.add('hidden');

  let tmpPhoto = '';
  $('#photoW').addEventListener('change', async e => { tmpPhoto = await pickPhoto(e.target.files[0]); $('#avW').innerHTML = avatar(tmpPhoto, ''); });
  $('#startW').onclick = () => {
    const v = $('#nameW').value.trim().slice(0, 20); if (!v) { toast('اكتب اسمك أول'); return; }
    S.name = v; S.photo = tmpPhoto; S.dirty = true; save(); $('#welcome').classList.add('hidden'); renderMe(); render(); sync(); setupNotifs();
  };
  if (!S.name) $('#welcome').classList.remove('hidden'); else setupNotifs();

  document.addEventListener('visibilitychange', () => { if (document.hidden) sync(); else { roll(); render(); fetchMyRank(); checkUpdate(); } });
  setInterval(() => { if (!document.hidden) { fetchMyRank(); if ($('#tab-rank').classList.contains('active')) loadBoard(true); } }, 45000);
  checkUpdate(); sync().then(() => { fetchMyRank(); if (ONLINE) { boardTab = 'all'; loadBoardQuiet(); } });
}
async function loadBoardQuiet() {
  try { const j = await (await fetch(DB + '/users.json?orderBy=' + enc('"total"') + '&limitToLast=100')).json(); if (j && !j.error) { boardAll = Object.entries(j).map(([id, v]) => ({ id, name: v.name || '', n: v.total || 0 })).sort((a, b) => b.n - a.n); updateChase(); } } catch (e) {}
}
init();
})();
