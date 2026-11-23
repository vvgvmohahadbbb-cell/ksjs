(() => {
'use strict';
const C = window.CFG || {}, P = (window.Capacitor && window.Capacitor.Plugins) || {}, VER = window.APP_VERSION || 0;
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
const fmt = n => Number(n || 0).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'tasbeeh_v2';
const AK = 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ';
// [id, نص, الدورة الافتراضية, الفضل]
const DHIKR = [
  ['s', 'سبحان الله', 33, 'أحب الكلام إلى الله أربع: سبحان الله والحمد لله ولا إله إلا الله والله أكبر (مسلم)'],
  ['h', 'الحمد لله', 33, 'الحمد لله تملأ الميزان (مسلم)'],
  ['a', 'الله أكبر', 34, 'من أحب الكلام إلى الله (مسلم)'],
  ['l', 'لا إله إلا الله', 100, 'أفضل الذكر لا إله إلا الله (الترمذي)'],
  ['g', 'أستغفر الله', 100, 'كان النبي ﷺ يستغفر الله في اليوم أكثر من سبعين مرة (البخاري)'],
  ['p', 'اللهم صلّ على محمد', 100, 'من صلى علي صلاة صلى الله عليه بها عشرًا (مسلم)'],
  ['w', 'سبحان الله وبحمده', 100, 'من قالها مئة مرة حُطّت خطاياه وإن كانت مثل زبد البحر (متفق عليه)'],
  ['q', 'لا حول ولا قوة إلا بالله', 100, 'كنز من كنوز الجنة (متفق عليه)'],
  ['v', 'حسبنا الله ونعم الوكيل', 100, 'قالها إبراهيم عليه السلام حين أُلقي في النار (البخاري)']
];
const ADH = [['آية الكرسي: ' + AK, 1], ['بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم', 3], ['رضيت بالله ربًا وبالإسلام دينًا وبمحمد ﷺ نبيًا', 3], ['حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم', 7], ['اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت', 1], ['سبحان الله وبحمده', 100]];
const SETS = {
  m: ['أذكار الصباح', ADH], e: ['أذكار المساء', ADH],
  a: ['بعد الصلاة', [['أستغفر الله', 3], ['اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام', 1], ['سبحان الله', 33], ['الحمد لله', 33], ['الله أكبر', 34], ['لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير', 1]]],
  s: ['أذكار النوم', [['آية الكرسي: ' + AK, 1], ['اللهم باسمك أموت وأحيا', 1], ['اللهم قني عذابك يوم تبعث عبادك', 3], ['سبحان الله', 33], ['الحمد لله', 33], ['الله أكبر', 34]]]
};
const CARDS = [
  'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', 'رَبِّ زِدْنِي عِلْمًا',
  'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي',
  'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ',
  'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا', 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ'
];
const LEVELS = [[0, 'مبتدئ', '🌱'], [100, 'ذاكر', '🌿'], [1000, 'مداوم', '🌙'], [5000, 'سابق', '⭐'], [20000, 'قنديل', '🏮'], [50000, 'نور', '💎'], [100000, 'أسطورة', '👑']];
const TOT = [100, 150, 200, 300], DM = [['p', 50], ['g', 100], ['l', 100], ['w', 100], ['q', 100], ['h', 100], ['s', 99]], AZ = ['m', 'e', 'a', 's'];
const TGT = [-1, 33, 100, 0];

const defaults = { uid: null, refresh: null, reg: false, dauD: '', seen: {}, clk: {}, adHide: '', num: '', lr: {}, hid: {}, stk0: false, name: '', total: 0, counts: {}, day: '', today: 0, td: {}, md: [], az: {}, ap: {}, chest: '', dhikr: 's', tgt: -1, vib: true, nf: true, streak: 0, best: 0, lastDay: '', freeze: 0, cards: [], joined: Date.now() };
let S;
try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = Object.assign({}, defaults); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const dayKey = t => new Date((t || Date.now()) + 3 * 36e5).toISOString().slice(0, 10);
const roll = () => { const d = dayKey(); if (S.day !== d) { S.day = d; S.today = 0; S.td = {}; S.md = []; S.az = {}; S.ap = {}; } };
const lvl = t => { let i = 0; LEVELS.forEach((l, k) => { if (t >= l[0]) i = k; }); return i; };
const streakNow = () => { const y = dayKey(Date.now() - 864e5); return (S.lastDay === S.day || S.lastDay === y || (S.lastDay === dayKey(Date.now() - 1728e5) && S.freeze > 0)) ? S.streak : 0; };
const D = id => DHIKR.find(x => x[0] === id) || DHIKR[0];
const tgt = () => S.tgt < 0 ? D(S.dhikr)[2] : S.tgt;

let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
function vib(strong) { if (!S.vib) return; try { if (P.Haptics) P.Haptics.impact({ style: strong ? 'HEAVY' : 'LIGHT' }); else if (navigator.vibrate) navigator.vibrate(strong ? 60 : 8); } catch (e) {} }
function modal(h) { $('#mBody').innerHTML = h + '<button class="btn gold wide" id="mOk">تمام</button>'; $('#modal').classList.remove('hidden'); $('#mOk').onclick = () => $('#modal').classList.add('hidden'); }

/* ---------- المهام اليومية ---------- */
function missions() {
  const n = Math.floor(Date.now() / 864e5), dm = DM[n % DM.length], az = AZ[n % AZ.length], t = TOT[n % TOT.length];
  return [
    { id: 't' + t, txt: 'سبّح ' + t + ' تسبيحة', n: t, p: S.today },
    { id: 'd' + dm[0], txt: 'قل «' + D(dm[0])[1] + '» ' + dm[1] + ' مرة', n: dm[1], p: S.td[dm[0]] || 0 },
    { id: 'z' + az, txt: 'أكمل ' + SETS[az][0], n: 1, p: S.az[az] === S.day ? 1 : 0, go: az }
  ];
}
function bump() {
  if (S.lastDay === S.day) return;
  const y = dayKey(Date.now() - 864e5), y2 = dayKey(Date.now() - 1728e5);
  if (S.lastDay === y) S.streak++;
  else if (S.lastDay === y2 && S.freeze > 0) { S.freeze--; S.streak++; toast('🧊 استخدمنا إجازة وحافظنا على سلسلتك'); }
  else S.streak = 1;
  S.best = Math.max(S.best, S.streak); S.lastDay = S.day;
  if (S.streak % 7 === 0) { S.freeze++; toast('🧊 كسبت إجازة سلسلة!'); } else toast('🔥 سلسلتك ' + S.streak + ' يوم');
}
function check() {
  const ms = missions(); let nw = 0;
  ms.forEach(m => { if (m.p >= m.n && S.md.indexOf(m.id) < 0) { S.md.push(m.id); nw++; } });
  if (nw) { vib(true); if (S.md.length < 3) toast('✅ أنجزت مهمة! باقي ' + (3 - S.md.length)); }
  if (S.md.length >= 2) bump();
  if (S.md.length >= 3 && S.chest !== S.day) {
    S.chest = S.day;
    const left = CARDS.map((c, i) => i).filter(i => S.cards.indexOf(i) < 0), pool = left.length ? left : CARDS.map((c, i) => i), k = pool[Math.floor(Math.random() * pool.length)];
    if (S.cards.indexOf(k) < 0) S.cards.push(k);
    setTimeout(() => modal('<h2>🎁 أنجزت كل مهام اليوم</h2><p class="mut">هديتك: دعاء جديد في مجموعتك (' + S.cards.length + '/' + CARDS.length + ')</p><div class="gift">' + esc(CARDS[k]) + '</div><p class="mut small">ارجع بكرة لمهام جديدة وهدية جديدة</p>'), 400);
  }
}

/* ---------- العرض ---------- */
const CIRC = 848.2;
function render() {
  roll();
  const id = S.dhikr, d = D(id), t = tgt(), c = S.counts[id] || 0;
  const rc = t ? (c && c % t === 0 ? t : c % t) : c;
  $('#dh').textContent = d[1]; $('#cnt').textContent = fmt(rc); $('#fadl').textContent = d[3];
  $('#ring').style.strokeDashoffset = CIRC * (1 - (t ? rc / t : (c % 100) / 100));
  $('#stats').textContent = 'اليوم ' + fmt(S.today) + ' · المجموع ' + fmt(S.total) + (t ? ' · دورات ' + Math.floor(c / t) : '');
  $('#tgtBtn').textContent = '🎯 ' + (t || '∞') + (S.tgt < 0 ? ' (تلقائي)' : '');
  $('#vibBtn').textContent = S.vib ? '📳 اهتزاز' : '🔇 صامت';
  $('#chStreak').textContent = '🔥 ' + streakNow(); $('#chFreeze').textContent = '🧊 ' + S.freeze;
  const L = LEVELS[lvl(S.total)]; $('#chLevel').textContent = L[2] + ' ' + L[1];
  const ms = missions();
  $('#miss').innerHTML = '<div class="mh"><b>مهام اليوم</b><span class="mut small">' + Math.min(3, S.md.length) + '/3 · الهدية بعد الثلاث</span></div>' + ms.map(m => {
    const done = S.md.indexOf(m.id) >= 0, pc = Math.min(100, Math.round(m.p / m.n * 100));
    return '<div class="ms ' + (done ? 'ok' : '') + '" ' + (m.go ? 'data-go="' + m.go + '"' : '') + '><i>' + (done ? '✅' : '⭕') + '</i><div><div>' + esc(m.txt) + '</div><div class="bar"><i style="width:' + pc + '%"></i></div></div></div>';
  }).join('');
}
function renderDhikrs() {
  $('#dhikrs').innerHTML = DHIKR.map(d => '<button data-id="' + d[0] + '" class="' + (d[0] === S.dhikr ? 'on' : '') + '">' + d[1] + '</button>').join('');
}
let azSet = 'm';
function renderAz() {
  $('#azSeg').innerHTML = Object.keys(SETS).map(k => '<button data-k="' + k + '" class="' + (k === azSet ? 'on' : '') + '">' + SETS[k][0] + (S.az[k] === S.day ? ' ✅' : '') + '</button>').join('');
  $('#azList').innerHTML = SETS[azSet][1].map((it, i) => {
    const r = (S.ap[azSet] || [])[i]; const rem = r === undefined ? it[1] : r;
    return '<div class="azc ' + (rem === 0 ? 'fin' : '') + '" data-i="' + i + '"><div class="azt">' + esc(it[0]) + '</div><div class="azn">' + (rem === 0 ? '✔' : '×' + rem) + '</div></div>';
  }).join('');
}
function renderMe() {
  $('#nameIn').value = S.name;
  const days = Math.max(1, Math.ceil((Date.now() - S.joined) / 864e5));
  $('#statsCard').innerHTML = '<div class="stats2"><div><b>' + fmt(S.total) + '</b><span class="mut small">المجموع</span></div><div><b>' + streakNow() + '</b><span class="mut small">السلسلة</span></div><div><b>' + S.best + '</b><span class="mut small">أفضل سلسلة</span></div><div><b>' + days + '</b><span class="mut small">يوم معنا</span></div></div>';
  $('#coll').innerHTML = CARDS.map((c, i) => S.cards.indexOf(i) >= 0 ? '<div class="cd on" data-c="' + i + '">📜</div>' : '<div class="cd">🔒</div>').join('');
  const cur = lvl(S.total);
  $('#badges').innerHTML = LEVELS.map((l, i) => '<div class="badge ' + (i <= cur ? 'on' : '') + '">' + l[2] + ' ' + l[1] + '<div class="mut small">' + fmt(l[0]) + '</div></div>').join('');
  $('#nfBtn').textContent = S.nf ? '🔔 التنبيهات: شغّالة' : '🔕 التنبيهات: مطفية';
  $('#verTxt').textContent = 'النسخة ' + VER;
}

/* ---------- التسبيح ---------- */
function tap() {
  roll();
  const id = S.dhikr, t = tgt(), pl = lvl(S.total);
  S.total++; S.today++; S.td[id] = (S.td[id] || 0) + 1;
  const c = S.counts[id] = (S.counts[id] || 0) + 1, endR = t && c % t === 0;
  vib(endR);
  if (lvl(S.total) > pl) { const L = LEVELS[lvl(S.total)]; toast('⬆️ مستوى جديد: ' + L[2] + ' ' + L[1]); }
  else if (endR) toast('✅ أكملت دورة ' + (c / t) + ' — ما شاء الله');
  check(); render(); save();
}
function undo() {
  const id = S.dhikr; if (!(S.counts[id] > 0)) return;
  S.counts[id]--; S.total = Math.max(0, S.total - 1); S.today = Math.max(0, S.today - 1); S.td[id] = Math.max(0, (S.td[id] || 0) - 1); render(); save();
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

/* ---------- التنبيهات: 5 يوميًا × 7 أيام بنصوص متنوعة ---------- */
const NT = [
  [['🌅 صباح الخير', 'أذكار الصباح بانتظارك، وهدية اليوم جاهزة'], ['☀️ يوم جديد', 'ابدأ بمهمة صغيرة، دقيقتان تكفي'], ['📿 بداية مباركة', 'مهام اليوم الثلاث جاهزة، شوف إيش اليوم']],
  [['⏳ خذ استراحة بذكر الله', 'مئة «سبحان الله وبحمده» وتحط عنك الخطايا'], ['🎯 مهمة بانتظارك', 'أنجز مهمة واحدة وكمّل سلسلتك'], ['💚 لحظة هدوء', 'قل «لا حول ولا قوة إلا بالله» عشر مرات']],
  [['📿 لسا في وقت', 'باقي على مهام اليوم القليل، كمّلها'], ['🕌 تذكير لطيف', 'صلّ على النبي ﷺ فمن صلى عليه مرة صلى الله عليه عشرًا'], ['✨ دقيقة تكفي', 'افتح سبح وسبّح دورة واحدة']],
  [['🌇 أذكار المساء', 'وقتها الآن، دقيقتان وتخلص'], ['🌙 مساء الخير', 'أذكار المساء وهدية اليوم بانتظارك'], ['📖 ختام النهار', 'اقرأ آية الكرسي وأذكار المساء']],
  [['🔥 لا تخلّي السلسلة تنكسر', 'أنجز مهمتين قبل ما ينتهي اليوم'], ['🧊 آخر الليل', 'مهمة بسيطة تحافظ على سلسلتك'], ['🌃 قبل النوم', 'أذكار النوم وتسبيح فاطمة، وتنام على ذكر']]
];
const SL = [[6, 30], [11, 15], [15, 40], [18, 0], [21, 30]];
async function setupNotifs() {
  const L = P.LocalNotifications; if (!L) return;
  try {
    const pend = await L.getPending(); if (pend.notifications.length) await L.cancel({ notifications: pend.notifications });
    if (!S.nf) return;
    const p = await L.requestPermissions(); if (p.display !== 'granted') return;
    const st = streakNow(), list = []; let id = 100;
    for (let d = 0; d < 7; d++) SL.forEach((s, k) => {
      const t = new Date(); t.setDate(t.getDate() + d); t.setHours(s[0], s[1] + ((d * 7 + k * 3) % 20), 0, 0);
      if (t.getTime() < Date.now() + 6e4) return;
      const m = NT[k][(d + k) % 3];
      list.push({ id: id++, title: (k === 4 && st > 1 && d === 0) ? '🔥 سلسلتك ' + st + ' يوم' : m[0], body: m[1], schedule: { at: t, allowWhileIdle: true } });
    });
    if (list.length) await L.schedule({ notifications: list });
  } catch (e) {}
}

/* ---------- السيرفر: إحصاءات + إعلانات ---------- */
const enc = encodeURIComponent;
const ONLINE = !!C.FB_API_KEY && !/PASTE/.test(C.FB_API_KEY) && /^https:\/\//.test(C.FB_DB_URL || '');
const DB = (C.FB_DB_URL || '').replace(/\/$/, '');
const okUrl = u => typeof u === 'string' && /^https:\/\/[^\s"'<>]{4,500}$/.test(u);
const okId = i => /^[-\w]{1,40}$/.test(i);
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
async function fb(path, method, body) {
  await auth();
  const r = await fetch(DB + '/' + path + (path.indexOf('?') >= 0 ? '&' : '?') + 'auth=' + tok, { method: method || 'GET', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}
async function net() {
  if (!ONLINE || !navigator.onLine) return;
  try {
    await auth(); roll();
    if (!S.reg) { try { await fb('.json', 'PATCH', { ['users/' + S.uid]: { t: Date.now(), v: VER } }); } catch (e) {} S.reg = true; }
    if (S.dauD !== S.day) { try { await fb('.json', 'PATCH', { ['dau/' + S.day + '/' + S.uid]: true }); } catch (e) {} S.dauD = S.day; }
    save(); showAd();
  } catch (e) {}
}
async function count(kind, id, field) {
  for (let i = 0; i < 3; i++) {
    try {
      const cur = await fb('ads/' + id + '/' + field + '.json');
      await fb('.json', 'PATCH', { ['ads/' + id + '/' + field]: (typeof cur === 'number' ? cur : 0) + 1, [kind + '/' + id + '/' + S.uid]: true });
      return true;
    } catch (e) {}
  }
  return false;
}
let adBusy = false;
async function showAd() {
  const box = $('#ad'); if (!box || adBusy) return; adBusy = true;
  try {
    box.innerHTML = ''; if (S.adHide === S.day) return;
    const j = await fb('ads.json') || {};
    const L = Object.entries(j).filter(([id, a]) => okId(id) && a && a.on === true && a.views < a.max && typeof a.title === 'string' && (okUrl(a.img) || okUrl(a.vid) || a.pic === true) && (!S.seen[id] || S.seen[id] === S.day));
    if (!L.length) return;
    const [id, a] = L[Math.floor(Math.random() * L.length)];
    const card = document.createElement('div'); card.className = 'adc';
    const tag = document.createElement('span'); tag.className = 'adl'; tag.textContent = 'إعلان';
    const x = document.createElement('button'); x.className = 'adx'; x.textContent = '✕';
    x.onclick = e => { e.stopPropagation(); S.adHide = S.day; save(); box.innerHTML = ''; };
    let pic = null;
    if (a.pic === true) { pic = await fb('adimg/' + id + '.json'); if (typeof pic !== 'string' || pic.indexOf('data:image/jpeg;base64,') !== 0 || pic.length > 300000) return; }
    let m;
    if (okUrl(a.vid)) { m = document.createElement('video'); m.muted = true; m.loop = true; m.autoplay = true; m.playsInline = true; m.setAttribute('playsinline', ''); m.src = a.vid; if (okUrl(a.img)) m.poster = a.img; }
    else { m = document.createElement('img'); m.alt = ''; m.src = pic || a.img; }
    const t = document.createElement('div'); t.className = 'adt'; t.textContent = a.title;
    const d = document.createElement('div'); d.className = 'mut small'; d.textContent = a.text || '';
    card.append(tag, x, m, t, d); box.appendChild(card);
    if (okUrl(a.link)) card.onclick = () => {
      if (!S.clk[id]) { S.clk[id] = 1; save(); count('adclick', id, 'clicks'); }
      window.open(a.link, '_blank', 'noopener');
    };
    if (!S.seen[id] && 'IntersectionObserver' in window) {
      let tm = null;
      const io = new IntersectionObserver(es => {
        if (es[0].isIntersecting) { if (!tm) tm = setTimeout(async () => { io.disconnect(); S.seen[id] = S.day; save(); count('adseen', id, 'views'); }, 1500); }
        else { clearTimeout(tm); tm = null; }
      }, { threshold: 0.6 });
      io.observe(card);
    }
  } catch (e) {} finally { adBusy = false; }
}

/* ---------- المحادثات (واتساب) ---------- */
const rnd = () => Math.random().toString(36).slice(2, 6);
const mkId = () => Date.now().toString(36).padStart(9, '0') + rnd();
const fnum = n => String(n).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
const avC = x => 'hsl(' + ([...String(x)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) >>> 0) % 360 + ',45%,38%)';
const avT = x => avC(x).replace('45%,38%', '70%,68%');
function avEl(name, grp) { const d = document.createElement('div'); d.className = 'av'; d.style.background = avC(name); d.textContent = grp ? '👥' : ([...String(name).trim()][0] || '?'); return d; }
function dayLbl(t) { const a = new Date(t), n = new Date(), y = new Date(Date.now() - 864e5); return a.toDateString() === n.toDateString() ? 'اليوم' : a.toDateString() === y.toDateString() ? 'أمس' : a.toLocaleDateString('ar', { day: 'numeric', month: 'long' }); }
function fmtT(t) { const a = new Date(t); return a.toDateString() === new Date().toDateString() ? a.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : dayLbl(t); }
const NAMES = {}; let CUR = null, pollT = null, listT = null, beatT = null, rec = null, SKEW = 0;
async function nameOf(u) {
  if (NAMES[u]) return NAMES[u];
  try { const n = await fb('profiles/' + u + '/name.json'); NAMES[u] = typeof n === 'string' ? n : 'مستخدم'; } catch (e) { NAMES[u] = 'مستخدم'; }
  return NAMES[u];
}
async function ensureNum() {
  if (S.num) return true;
  if (!ONLINE) return false;
  await auth();
  try { const n = await fb('profiles/' + S.uid + '/num.json'); if (typeof n === 'string') { S.num = n; save(); return true; } } catch (e) {}
  for (let i = 0; i < 8; i++) {
    const n = String(100000000 + Math.floor(Math.random() * 900000000));
    try { await fb('.json', 'PATCH', { ['numbers/' + n]: S.uid, ['profiles/' + S.uid + '/num']: n, ['profiles/' + S.uid + '/name']: S.name || 'مستخدم' }); S.num = n; save(); return true; } catch (e) {}
  }
  return false;
}
async function beat() {
  if (!ONLINE || document.hidden || !S.uid) return;
  try { const r = await fb('presence/' + S.uid + '/t.json', 'PUT', { '.sv': 'timestamp' }); if (typeof r === 'number') SKEW = r - Date.now(); } catch (e) {}
}
function startBeat() { if (beatT) return; beat(); beatT = setInterval(beat, 30000); }
function ask(t, ph, cb) {
  $('#mBody').innerHTML = '<h3>' + t + '</h3><input id="qIn" placeholder="' + ph + '"><button class="btn gold wide" id="qOk">تمام</button><button class="btn ghost wide" id="qNo">إلغاء</button>';
  $('#modal').classList.remove('hidden');
  $('#qNo').onclick = () => $('#modal').classList.add('hidden');
  $('#qOk').onclick = () => { const v = $('#qIn').value.trim(); $('#modal').classList.add('hidden'); cb(v); };
}
async function chatInit() {
  clearInterval(listT);
  if (!ONLINE) { $('#myNum').textContent = 'تحتاج إنترنت'; return; }
  $('#myNum').textContent = '...';
  if (!(await ensureNum())) { $('#myNum').textContent = 'تعذر إنشاء الرقم، جرّب لاحقًا'; return; }
  $('#myNum').textContent = fnum(S.num); startBeat();
  loadList(); listT = setInterval(() => { if ($('#tab-chat').classList.contains('active') && !CUR) loadList(); }, 8000);
}
async function loadList() {
  if (!S.num) return;
  let j = {}; try { j = await fb('inbox/' + S.uid + '.json') || {}; } catch (e) { return; }
  const rows = await Promise.all(Object.entries(j).sort((a, b) => b[1].t - a[1].t).map(async ([cid, v]) => {
    let t;
    if (v.g) { let n = null; try { n = await fb('groups/' + cid + '/n.json'); } catch (e) {} t = n || 'مجموعة'; } else t = await nameOf(v.w);
    return [cid, v, t];
  }));
  const box = $('#chList'); box.innerHTML = rows.length ? '' : '<div class="mut center small">ما عندك محادثات بعد</div>';
  rows.forEach(([cid, v, t]) => {
    const un = v.r && v.t > (S.lr[cid] || 0), d = document.createElement('div'); d.className = 'chi' + (un ? ' un' : '');
    const body = document.createElement('div'); body.className = 'cb';
    const n = document.createElement('div'); n.className = 'cn'; n.textContent = t;
    const tm = document.createElement('div'); tm.className = 'ct'; tm.textContent = (un ? '● ' : '') + fmtT(v.t);
    body.append(n, tm); d.append(avEl(t, v.g), body);
    d.onclick = () => openChat(cid, v.g ? { g: true, title: t } : { w: v.w, title: t }); box.appendChild(d);
  });
}
async function openChat(cid, o) {
  const c = CUR = { cid, g: !!o.g, w: o.w, shown: {}, els: {}, tk: {}, rd: '', su: {}, reply: null };
  S.lr[cid] = Date.now(); save(); $('#rpl').hidden = true; $('#stkP').hidden = true;
  $('#cvT').textContent = o.title; $('#cvA').innerHTML = ''; $('#cvA').appendChild(avEl(o.title, o.g)); $('#cvS').textContent = ''; $('#cvInv').hidden = !o.g; $('#msgs').innerHTML = ''; $('#cv').classList.remove('hidden');
  if (o.g) { try { c.ownerId = await fb('groups/' + cid + '/o.json'); } catch (e) {} c.owner = c.ownerId === S.uid; }
  if (CUR !== c) return;
  clearInterval(pollT); pollMsgs(); pollT = setInterval(pollMsgs, 2500);
}
function closeChat() { clearInterval(pollT); CUR = null; $('#cv').classList.add('hidden'); loadList(); }
function setStatus(t) {
  const el = $('#cvS'); if (typeof t !== 'number') { el.textContent = ''; return; }
  el.textContent = Date.now() + SKEW - t < 70000 ? '🟢 متصل' : 'آخر ظهور ' + new Date(t - SKEW).toLocaleString('ar', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' });
}
function paintTicks(c) {
  Object.keys(c.tk).forEach(id => { const rd = c.rd && id <= c.rd; c.tk[id].textContent = rd ? '✓✓' : '✓'; c.tk[id].className = 'tk' + (rd ? ' rd' : ''); });
}
async function pollMsgs() {
  if (!CUR || !navigator.onLine || document.hidden) return; const c = CUR;
  try {
    const j = await fb('msgs/' + c.cid + '.json?orderBy=%22$key%22&limitToLast=50') || {}; if (CUR !== c) return;
    const keys = Object.keys(j).sort(), box = $('#msgs'), stick = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    for (const id of keys) { if (c.shown[id]) continue; c.shown[id] = 1; await addBubble(id, j[id], c); }
    Object.keys(c.els).forEach(id => { if (!j[id] && (keys.length < 50 || id >= keys[0])) { c.els[id].remove(); delete c.els[id]; delete c.tk[id]; } });
    if (stick || !c.init) { box.scrollTop = box.scrollHeight; c.init = 1; }
    if (!c.g) {
      try { const r = await fb('reads/' + c.cid + '/' + c.w + '.json'); c.rd = typeof r === 'string' ? r : ''; paintTicks(c); setStatus(await fb('presence/' + c.w + '/t.json')); } catch (e) {}
      const last = keys[keys.length - 1];
      if (last && last !== c.mine) { c.mine = last; S.lr[c.cid] = Date.now(); fb('reads/' + c.cid + '/' + S.uid + '.json', 'PUT', last).catch(() => {}); }
    }
  } catch (e) {
    if (c.g && (e.message === '401' || e.message === '403')) { toast('لم تعد عضوًا في المجموعة'); fb('inbox/' + S.uid + '/' + c.cid + '.json', 'DELETE').catch(() => {}); closeChat(); }
  }
}
async function delMsg(id, c) {
  try { await fb('.json', 'PATCH', { ['msgs/' + c.cid + '/' + id]: null, ['media/' + c.cid + '/' + id]: null }); if (c.els[id]) { c.els[id].remove(); delete c.els[id]; delete c.tk[id]; } } catch (e) { toast('تعذر الحذف'); }
}
async function openDoc(id, m, c) {
  try {
    const u = String(await fb('media/' + c.cid + '/' + id + '.json')), mt = u.match(/^data:([^;,]*)/), b64 = u.split(',')[1];
    const FS = P.Filesystem, FO = P.FileOpener; if (!b64 || !FS || !FO) return toast('غير مدعوم');
    const name = String(m.x || 'file').replace(/[^\w.\u0600-\u06FF -]/g, '_').slice(0, 60);
    const r = await FS.writeFile({ path: name, data: b64, directory: 'CACHE' });
    await FO.open({ filePath: r.uri, contentType: (mt && mt[1]) || 'application/octet-stream', openWithDefault: true });
  } catch (e) { toast('تعذر فتح الملف'); }
}
const SK = 'tasbeeh_stk'; let STK = []; try { STK = JSON.parse(localStorage.getItem(SK) || '[]'); } catch (e) {}
const saveStk = () => { try { localStorage.setItem(SK, JSON.stringify(STK)); } catch (e) { toast('الذاكرة ممتلئة'); } };
const stkOk = u => typeof u === 'string' && /^data:image\/(webp|png);base64,[A-Za-z0-9+\/=]+$/.test(u) && u.length <= 90000;
const skKey = u => u.length + u.slice(-24);
function addStk(u) {
  if (!stkOk(u)) return toast('ملصق غير صالح'); if (STK.some(x => skKey(x) === skKey(u))) return toast('موجود عندك');
  if (STK.length >= 40) return toast('الحد 40 ملصق'); STK.unshift(u); saveStk(); toast('أضيف إلى ملصقاتك');
}
function mkStk(im, cb) {
  const c = document.createElement('canvas'), s = Math.min(256 / im.width, 256 / im.height, 1); c.width = Math.max(1, Math.round(im.width * s)); c.height = Math.max(1, Math.round(im.height * s));
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); let q = .85, d; do { d = c.toDataURL('image/webp', q); q -= .15; } while (d.length > 80000 && q > .1); cb(d);
}
function starter() {
  if (STK.length || S.stk0) return; S.stk0 = 1; save();
  ['🤲', '❤️', '👍', '😂', '🌙', '🕌', '📿', '😢', '🎉', '🙏', '💚', '🌹'].forEach(e => { const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'); x.font = '120px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 80, 88); STK.push(c.toDataURL('image/webp', .8)); });
  saveStk();
}
function renderStk(edit) {
  const p = $('#stkP'); p.innerHTML = '';
  const add = document.createElement('div'); add.className = 'sk add'; add.textContent = '+'; add.onclick = () => $('#stkF').click(); p.appendChild(add);
  STK.forEach((u, i) => { const d = document.createElement('div'); d.className = 'sk' + (edit ? ' ed' : ''); const im = document.createElement('img'); im.src = u; d.appendChild(im); d.onclick = () => { if (edit) { STK.splice(i, 1); saveStk(); renderStk(true); } else { sendStk(u); } }; p.appendChild(d); });
  const e = document.createElement('div'); e.className = 'sk add'; e.textContent = edit ? '✓' : '🗑'; e.onclick = () => renderStk(!edit); p.appendChild(e);
}
function sendStk(u) { if (!stkOk(u)) return toast('ملصق غير صالح'); send('s', null, u); }
function copyTxt(t) {
  const f = () => { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (x) {} a.remove(); };
  if (navigator.clipboard) navigator.clipboard.writeText(t).catch(f); else f();
}
const snip = m => m.k === 't' ? String(m.x || '').slice(0, 60) : m.k === 'i' ? '🖼 صورة' : m.k === 'a' ? '🎤 رسالة صوتية' : m.k === 's' ? 'ملصق' : '📄 ' + String(m.x || 'ملف').slice(0, 40);
function msgMenu(id, m, c, mine) {
  const can = mine || c.owner; let h = '<h3>الرسالة</h3>';
  if (m.k === 't') h += '<button class="btn ghost wide" id="mCp">📋 نسخ</button>';
  if (m.k === 's' && !mine) h += '<button class="btn ghost wide" id="mSk">➕ إضافة إلى ملصقاتي</button>';
  h += '<button class="btn ghost wide" id="mRp">↩ رد</button><button class="btn ghost wide" id="mHd">🙈 حذف لدي فقط</button>' + (can ? '<button class="btn ghost wide" id="mDl">🗑 حذف للجميع</button>' : '');
  modal(h); const close = () => $('#modal').classList.add('hidden');
  if ($('#mCp')) $('#mCp').onclick = () => { copyTxt(String(m.x || '')); close(); toast('تم النسخ'); };
  if ($('#mSk')) $('#mSk').onclick = () => { close(); addStk(c.su[id]); };
  $('#mRp').onclick = () => { close(); c.reply = snip(m); $('#rplT').textContent = c.reply; $('#rpl').hidden = false; $('#msgIn').focus(); };
  $('#mHd').onclick = () => { close(); const hh = S.hid[c.cid] = S.hid[c.cid] || {}; hh[id] = 1; save(); if (c.els[id]) { c.els[id].remove(); delete c.els[id]; delete c.tk[id]; } };
  if ($('#mDl')) $('#mDl').onclick = () => { close(); delMsg(id, c); };
}
async function addBubble(id, m, c) {
  if ((S.hid[c.cid] || {})[id]) return;
  const mine = m.f === S.uid, d = document.createElement('div'); d.className = 'bb ' + (mine ? 'me' : 'ot'); c.els[id] = d;
  const dy = new Date(Number(m.t) || 0).toDateString();
  if (dy !== c.lastDay) { const sp = document.createElement('div'); sp.className = 'ds'; sp.textContent = dayLbl(Number(m.t) || 0); $('#msgs').appendChild(sp); c.lastDay = dy; c.lastF = null; }
  if (c.lastF === m.f) d.classList.add('gp'); c.lastF = m.f;
  if (m.k === 's') d.classList.add('sk2');
  const x = document.createElement('span'); x.className = 'bx'; x.textContent = '⋯'; x.onclick = () => msgMenu(id, m, c, mine); d.appendChild(x);
  if (c.g && !mine && !d.classList.contains('gp')) { const s = document.createElement('div'); s.className = 'bs'; s.textContent = await nameOf(m.f); s.style.color = avT(s.textContent); d.appendChild(s); }
  if (typeof m.q === 'string' && m.q) { const q = document.createElement('div'); q.className = 'qt'; q.textContent = m.q.slice(0, 80); d.appendChild(q); }
  const b = document.createElement('div');
  if (m.k === 't') b.textContent = String(m.x || '');
  else if (m.k === 'f') { b.className = 'bm'; b.textContent = '📄 ' + String(m.x || 'ملف'); b.onclick = () => openDoc(id, m, c); }
  else if (m.k === 's') {
    try { const u = await fb('media/' + c.cid + '/' + id + '.json'); if (stkOk(u)) { c.su[id] = u; const im = document.createElement('img'); im.className = 'stk'; im.src = u; b.appendChild(im); } else b.textContent = '🖼'; } catch (e) { b.textContent = '🖼'; }
  } else {
    b.className = 'bm'; b.textContent = m.k === 'i' ? '🖼 اضغط للعرض' : '🎤 اضغط للتشغيل';
    b.onclick = async () => {
      try {
        const u = await fb('media/' + c.cid + '/' + id + '.json'); if (typeof u !== 'string') return;
        if (m.k === 'i' && u.indexOf('data:image/jpeg;base64,') === 0) { const im = document.createElement('img'); im.src = u; b.replaceWith(im); }
        else if (m.k === 'a' && u.indexOf('data:audio/') === 0) new Audio(u).play();
      } catch (e) { toast('تعذر التحميل'); }
    };
  }
  d.appendChild(b);
  const t = document.createElement('div'); t.className = 'bt'; t.textContent = new Date(Number(m.t) || 0).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
  if (mine && !c.g) { const k = document.createElement('span'); k.className = 'tk'; k.textContent = '✓'; c.tk[id] = k; t.appendChild(k); }
  d.appendChild(t); $('#msgs').appendChild(d);
}
async function send(k, x, media) {
  if (!CUR || !ONLINE) return; const c = CUR, id = mkId(), now = Date.now(), up = {}, m = { f: S.uid, t: now, k };
  if (k === 't') m.x = x; else { m.m = true; if (k === 'f') m.x = x; up['media/' + c.cid + '/' + id] = media; }
  if (c.reply) { m.q = c.reply; c.reply = null; $('#rpl').hidden = true; }
  $('#stkP').hidden = true;
  up['msgs/' + c.cid + '/' + id] = m;
  up['inbox/' + S.uid + '/' + c.cid] = c.g ? { t: now, g: true } : { t: now, w: c.w };
  if (!c.g) up['inbox/' + c.w + '/' + c.cid] = { t: now, w: S.uid, r: true };
  try { await fb('.json', 'PATCH', up); pollMsgs(); } catch (e) { toast('تعذر الإرسال'); }
}
function sendImg(f) {
  if (!f) return; const im = new Image();
  im.onload = () => {
    const w = Math.min(640, im.width), h = Math.round(im.height * w / im.width), c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h);
    let q = .8, d; do { d = c.toDataURL('image/jpeg', q); q -= .1; } while (d.length > 150000 && q > .2);
    if (d.length > 240000) return toast('الصورة كبيرة'); send('i', null, d);
  };
  im.onerror = () => toast('ملف غير صالح'); im.src = URL.createObjectURL(f);
}
function sendDoc(f) {
  if (!f) return; if (f.size > 150000) return toast('الملف كبير، الحد 150 كيلوبايت');
  const fr = new FileReader(); fr.onload = () => send('f', f.name.slice(0, 60), fr.result); fr.readAsDataURL(f);
}
async function toggleRec() {
  if (rec) { rec.stop(); return; }
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
    const r = new MediaRecorder(st, mime ? { mimeType: mime, audioBitsPerSecond: 16000 } : { audioBitsPerSecond: 16000 }), ch = [];
    r.ondataavailable = e => { if (e.data.size) ch.push(e.data); };
    const to = setTimeout(() => { if (r.state === 'recording') r.stop(); }, 45000);
    r.onstop = () => {
      clearTimeout(to); st.getTracks().forEach(t => t.stop()); rec = null; $('#mic').classList.remove('rec');
      const b = new Blob(ch, { type: r.mimeType || 'audio/webm' }); if (b.size > 150000) return toast('التسجيل طويل');
      const fr = new FileReader(); fr.onload = () => send('a', null, fr.result); fr.readAsDataURL(b);
    };
    r.start(); rec = r; $('#mic').classList.add('rec');
  } catch (e) { toast('ما قدرت أستخدم المايك'); }
}
async function groupPanel() {
  const c = CUR; let mem = {}, v = '';
  try { mem = await fb('groups/' + c.cid + '/mem.json') || {}; v = await fb('groups/' + c.cid + '/v.json'); } catch (e) { return toast('تعذر التحميل'); }
  const ids = Object.keys(mem), names = await Promise.all(ids.map(nameOf)), link = 'ksjs://join/' + c.cid + '/' + v;
  let h = '<h3>المجموعة</h3><div class="gift small" style="word-break:break-all;font-size:13px;direction:ltr">' + esc(link) + '</div><button class="btn ghost wide" id="gCp">نسخ الرابط</button>' + (c.owner ? '<button class="btn ghost wide" id="gRs">🔄 تغيير الرابط</button>' : '') + '<div class="mut small">الأعضاء (' + ids.length + ')</div>';
  ids.forEach((u, i) => { h += '<div class="mr"><span>' + esc(names[i]) + (u === c.ownerId ? ' 👑' : '') + '</span>' + (c.owner && u !== S.uid ? '<button class="btn ghost" data-k="' + esc(u) + '">طرد</button>' : '') + '</div>'; });
  if (!c.owner) h += '<button class="btn ghost wide" id="gLv">🚪 مغادرة المجموعة</button>';
  modal(h);
  $('#gCp').onclick = () => { try { navigator.clipboard.writeText(link); toast('تم النسخ'); } catch (e) {} };
  if (c.owner) $('#gRs').onclick = async () => {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
    try { await fb('groups/' + c.cid + '/v.json', 'PUT', code); toast('تم تغيير الرابط'); $('#modal').classList.add('hidden'); } catch (e) { toast('تعذر'); }
  };
  $$('#mBody [data-k]').forEach(b => b.onclick = async () => { try { await fb('groups/' + c.cid + '/mem/' + b.dataset.k + '.json', 'DELETE'); toast('تم الطرد'); groupPanel(); } catch (e) { toast('تعذر الطرد'); } });
  if (!c.owner) $('#gLv').onclick = async () => { try { await fb('groups/' + c.cid + '/mem/' + S.uid + '.json', 'DELETE'); await fb('inbox/' + S.uid + '/' + c.cid + '.json', 'DELETE'); $('#modal').classList.add('hidden'); closeChat(); } catch (e) { toast('تعذر'); } };
}
function bindChat() {
  $('#chNew').onclick = () => ask('رقم الشخص', '123456789', async v => {
    v = v.replace(/\D/g, ''); if (!/^[1-9]\d{8}$/.test(v)) return toast('الرقم لازم 9 أرقام'); if (v === S.num) return toast('هذا رقمك');
    try { const u = await fb('numbers/' + v + '.json'); if (typeof u !== 'string') return toast('ما في أحد بهذا الرقم'); openChat([S.uid, u].sort().join('_'), { w: u, title: await nameOf(u) }); } catch (e) { toast('تعذر البحث'); }
  });
  $('#chGrp').onclick = () => ask('اسم المجموعة', 'مثال: الأصدقاء', async nme => {
    if (!nme) return; const code = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
    try {
      const r = await fb('groups.json', 'POST', { n: nme.slice(0, 40), o: S.uid, v: code, t: Date.now(), mem: { [S.uid]: code } });
      await fb('inbox/' + S.uid + '/' + r.name + '.json', 'PUT', { t: Date.now(), g: true }); openChat(r.name, { g: true, title: nme.slice(0, 40) });
    } catch (e) { toast('تعذر إنشاء المجموعة'); }
  });
  $('#chJoin').onclick = () => ask('الصق رابط المجموعة', 'ksjs://join/...', async v => {
    const m = v.match(/join\/([-\w]{10,40})\/([a-z0-9]{10,30})/i); if (!m) return toast('الرابط غير صحيح');
    try {
      const n = await fb('groups/' + m[1] + '/n.json'); if (!n) return toast('المجموعة غير موجودة');
      await fb('.json', 'PATCH', { ['groups/' + m[1] + '/mem/' + S.uid]: m[2], ['inbox/' + S.uid + '/' + m[1]]: { t: Date.now(), g: true } }); openChat(m[1], { g: true, title: n });
    } catch (e) { toast('الرابط منتهي أو غير صحيح'); }
  });
  $('#cvBack').onclick = closeChat; $('#cvInv').onclick = groupPanel;
  const go = () => { const i = $('#msgIn'), v = i.value.trim(); if (!v) return; i.value = ''; const b = $('#sendB'); b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 200); send('t', v.slice(0, 1000)); };
  $('#sendB').onclick = go; $('#msgIn').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  $('#imgF').onchange = e => { sendImg(e.target.files[0]); e.target.value = ''; };
  $('#docF').onchange = e => { sendDoc(e.target.files[0]); e.target.value = ''; };
  $('#mic').onclick = toggleRec;
  $('#stkB').onclick = () => { starter(); const p = $('#stkP'); p.hidden = !p.hidden; if (!p.hidden) renderStk(false); };
  $('#stkF').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; const im = new Image(); im.onload = () => mkStk(im, d => { addStk(d); renderStk(false); }); im.onerror = () => toast('ملف غير صالح'); im.src = URL.createObjectURL(f); };
  $('#rplX').onclick = () => { if (CUR) CUR.reply = null; $('#rpl').hidden = true; };
}

/* ---------- ربط الأحداث ---------- */
function switchTab(t) {
  $$('.tab').forEach(x => x.classList.toggle('active', x.id === 'tab-' + t));
  $$('nav button').forEach(x => x.classList.toggle('on', x.dataset.tab === t));
  if (t === 'az') renderAz(); if (t === 'me') renderMe();
  if (t === 'chat') chatInit();
}
function init() {
  roll(); renderDhikrs(); render(); renderMe();
  $('#tap').addEventListener('pointerdown', e => { e.preventDefault(); const b = $('#tap'); b.classList.add('pop'); tap(); setTimeout(() => b.classList.remove('pop'), 90); });
  $('#dhikrs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.dhikr = b.dataset.id; save(); renderDhikrs(); render(); });
  $('#tgtBtn').onclick = () => { S.tgt = TGT[(TGT.indexOf(S.tgt) + 1) % TGT.length]; save(); render(); };
  $('#vibBtn').onclick = () => { S.vib = !S.vib; save(); render(); };
  $('#undo').onclick = undo;
  $('#resetCnt').onclick = () => { S.counts[S.dhikr] = 0; save(); render(); };
  $('#miss').addEventListener('click', e => { const m = e.target.closest('[data-go]'); if (m) { azSet = m.dataset.go; switchTab('az'); } });
  $$('nav button').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $('#azSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { azSet = b.dataset.k; renderAz(); } });
  $('#azList').addEventListener('click', e => {
    const c = e.target.closest('.azc'); if (!c) return; roll();
    const i = +c.dataset.i, items = SETS[azSet][1], a = S.ap[azSet] = S.ap[azSet] || items.map(x => x[1]);
    if (a[i] > 0) { a[i]--; vib(a[i] === 0); }
    if (a.every(x => x === 0) && S.az[azSet] !== S.day) { S.az[azSet] = S.day; toast('🤲 تقبّل الله، أتممت ' + SETS[azSet][0]); check(); render(); }
    save(); renderAz();
  });
  $('#coll').addEventListener('click', e => { const c = e.target.closest('[data-c]'); if (c) modal('<div class="gift">' + esc(CARDS[+c.dataset.c]) + '</div>'); });
  $('#nameIn').addEventListener('change', e => { S.name = e.target.value.trim().slice(0, 20); save(); if (S.num) fb('profiles/' + S.uid + '/name.json', 'PUT', S.name || 'مستخدم').catch(() => {}); });
  $('#nfBtn').onclick = () => { S.nf = !S.nf; save(); renderMe(); setupNotifs(); };
  $('#uGo').onclick = doUpdate; $('#uLater').onclick = () => $('#update').classList.add('hidden');
  $('#startW').onclick = () => { S.name = $('#nameW').value.trim().slice(0, 20); save(); $('#welcome').classList.add('hidden'); renderMe(); setupNotifs(); };
  if (!S.joined || !localStorage.getItem(KEY)) { S.joined = Date.now(); save(); $('#welcome').classList.remove('hidden'); } else setupNotifs();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { roll(); render(); checkUpdate(); setupNotifs(); net(); beat(); } });
  bindChat(); if (S.num) startBeat(); checkUpdate(); net();
}
init();
})();
