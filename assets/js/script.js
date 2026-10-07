/* ==================================================================
   DENI ARP - perilaku halaman

   Bagian yang paling sering diubah ada di paling atas:

     1. LINES    kalimat Hu Tao
     2. PORT     faceplate

   Sisanya tidak perlu disentuh kecuali kamu mau menambah tombol.
   ================================================================== */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- PORT ---------- */
const ORDER = { active: 0, done: 1, offline: 2 };
const list = document.querySelector('.entries');
const entries = [...list.querySelectorAll('.entry')]
  .sort((a, b) => ORDER[a.dataset.state] - ORDER[b.dataset.state]); // sort is stable: same state keeps HTML order
entries.forEach((entry, i) => {
  list.append(entry);
  entry.querySelector('.entry-num').textContent = String(i + 2).padStart(2, '0'); // port 01 = this site
});

const PER_UNIT = 12;
const used = entries.length + 1; // +1 = the jack for this site
const cap = Math.max(PER_UNIT, Math.ceil(used / PER_UNIT) * PER_UNIT);
const count = (s) => entries.filter(e => e.dataset.state === s).length;
const stats = { active: count('active'), done: count('done'), offline: count('offline'), free: cap - used };
const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => (k in stats ? stats[k] : ''));

const SR = { data: 'dipakai untuk situs ini', active: 'sedang digarap', done: 'selesai', offline: 'offline', free: 'kosong' };
const states = ['data', ...entries.map(e => e.dataset.state)];
while (states.length < cap) states.push('free');

const plate = document.getElementById('jacks');
for (let u = 0; u < cap; u += PER_UNIT) {
  const ol = document.createElement('ol');
  ol.className = 'jacks';
  states.slice(u, u + PER_UNIT).forEach((s, j) => {
    const li = document.createElement('li');
    li.className = 'jack';
    li.dataset.state = s;
    li.innerHTML = '<span class="led" aria-hidden="true"></span><span class="port">' +
      String(u + j + 1).padStart(2, '0') + '</span><span class="sr-only">' + SR[s] + '</span>';
    ol.append(li);
  });
  plate.append(ol);
}

document.getElementById('panelFoot').innerHTML =
  '<span>' + stats.active + ' jalan</span><span>' + stats.done + ' selesai</span>' +
  '<span>' + stats.offline + ' offline</span><span>' + stats.free + ' kosong</span>';

/* Kedip LAN: tiap proyek active dapat pola, durasi, dan jeda sendiri,
   diacak tiap muat halaman. Jack dan entry satu proyek memakai profil
   yang sama supaya kedipannya bareng. */
if (!reduced) {
  const LAN = ['lan-a', 'lan-b', 'lan-c'];
  const jacks = plate.querySelectorAll('.jack');
  entries.forEach((entry, i) => {
    if (entry.dataset.state !== 'active') return;
    const pat = LAN[Math.floor(Math.random() * LAN.length)];
    const dur = +(1.1 + Math.random() * 2.3).toFixed(1);
    const delay = -(Math.random() * dur).toFixed(2);
    [entry.querySelector('.led'), jacks[i + 1] && jacks[i + 1].querySelector('.led')].forEach(led => {
      if (!led) return;
      led.style.setProperty('--lan', pat);
      led.style.setProperty('--lan-dur', dur + 's');
      led.style.setProperty('--lan-delay', delay + 's');
    });
  });

  /* Trafik ramai: sesekali satu proyek kebanjiran lalu lintas, kedipnya
     rapat dan terus-menerus beberapa detik, lalu kembali normal. */
  entries.forEach((entry, i) => {
    if (entry.dataset.state !== 'active') return;
    const leds = [entry.querySelector('.led'), jacks[i + 1] && jacks[i + 1].querySelector('.led')].filter(Boolean);
    const loop = () => {
      setTimeout(() => {
        if (document.hidden) return loop();
        const speed = (0.4 + Math.random() * 0.35).toFixed(2) + 's';
        leds.forEach((l) => { l.style.setProperty('--busy-dur', speed); l.classList.add('is-busy'); });
        setTimeout(() => { leds.forEach((l) => l.classList.remove('is-busy')); loop(); }, 3500 + Math.random() * 5500);
      }, 7000 + Math.random() * 18000);
    };
    loop();
  });
}

/* ==================================================================
   1. LINES
   Hu Tao, Director ke-77 Rumah Pemakaman Wangsheng.
   Aturan suara: 1-2 kalimat pendek, maksimal sekitar 120 huruf,
   bahasa santai (aku/kamu). Semua kalimat asli, bukan turunan
   dari teks game.
   ================================================================== */
const LINES = {
  /* {active} {done} {offline} {free} diisi otomatis dari data-state proyek */

  welcome: [
    'Hup! Pengunjung baru! Aku Hu Tao, Direktur ke-77 Rumah Duka Wangsheng. Hari ini aku pemandu portofolio Deni!',
    'Ehehe, selamat datang! Aku sampai loncat-loncat saking senangnya. Ayo, ikut aku keliling!',
    'Satu tamu masuk, satu kabar baik buat hari ini. Hup, hup, ayo mulai!',
    'Selamat datang di rak Deni! Aku yang jaga pintu, jadi jangan nakal ya. Ehehe~',
    'Aiya, ada tamu! Tenang, ini bukan rumah duka... kecuali ada port yang mati suri.'
  ],
  welcomeBack: [
    'Eh, kamu balik lagi! Aku sampai berkedip dua kali, takut salah lihat. Ehehe~',
    'Aiya, tamu lama! Rak Deni masih menyala, kok.',
    'Kangen ya? Wajar. Aku memang gampang dikangenin.',
    'Selamat datang kembali! Semua port sudah kuperiksa, aman. Mataku melek terus, kok.'
  ],
  newProject: [
    'Ada penghuni baru di rak! Aku sampai loncat. Ayo kita lihat!',
    'Aiya, ada port yang terisi sejak kamu pergi. Deni ternyata rajin juga!',
    'Ada proyek baru sejak terakhir kamu mampir. Cek di bawah, ya!'
  ],
  hero: [
    'Ini rak milik Deni. {active} proyek jalan, {done} tuntas, {offline} beristirahat, {free} port kosong.',
    'Lampu yang berkedip itu proyek yang masih digarap. Yang diam sudah tuntas atau lagi tidur.',
    'Klik aku kalau mau ganti topik. Aku jarang menolak tamu, itu prinsip rumah duka.',
    'Deni belajar jaringan di SMK, sekarang lanjut kuliah informatika. Aku bangga, padahal bukan siapa-siapanya. Ehehe.'
  ],
  proyek: [
    'Urutannya begini: yang sedang digarap di atas, yang sudah selesai di tengah, yang beristirahat di bawah.',
    'Ada {active} proyek yang masih bernapas. Semoga panjang umur, ehehe.',
    'Masih ada {free} port kosong. Deni bilang itu ruang tumbuh, aku bilang itu kamar kosong siap huni.',
    'Tiap proyek punya nomor port. Seperti nomor lemari di rumah duka: rapi dan tidak pernah tertukar.',
    'Yang sudah selesai tidak kupaksa bangun lagi. Yang sedang jalan, semangat ya!'
  ],
  keahlian: [
    'Crimping kabel itu seni. Urutan T568B salah sedikit, sinyalnya jadi arwah penasaran.',
    'Semua ini dipraktikkan langsung di lab sekolah, bukan cuma dari buku. Tangan kotor itu bagus.',
    'MikroTik itu router favorit Deni. Kalau link-nya mati suri, dia yang bangunkan. Aku cuma menghibur.',
    'Deni bisa banyak hal, tapi belum bisa membangkitkan arwah. Aku masih mengajarinya, ehehe.',
    'Lihat kolom "Dipakai untuk". Kemampuan tanpa kegunaan itu seperti arwah tanpa urusan: bingung sendiri.'
  ],
  tentang: [
    'Kalau butuh orang untuk jaringan atau IoT, kirim email saja. Deni pasti membalas. Aku jamin, bonus doa.',
    'Situs ini ditulis Deni sendiri, tanpa template. Aku cuma numpang jadi maskot.',
    'Bagian paling jujur dari situs ini. Baca pelan-pelan ya.',
    'Hidup itu singkat, jadi bikinlah sesuatu selagi sempat. Deni sudah mulai, kamu juga bisa.',
    'Katanya orang yang rajin bikin proyek umurnya panjang. Itu bukan fakta, tapi aku percaya.'
  ],
  note: [
    'Tahukah kamu? Semua tata letak dan ikon di sini dibuat tanpa template.',
    'Router favorit Deni itu MikroTik. Jangan bilang router lain, nanti mereka iri.',
    'Kalau ada proyek yang butuh bantuan, kirim email saja. Cepat, dan tidak nyasar.',
    'Ada tombol musik di pojok atas. Kalau berani, nyalakan. Aku suka yang ada suasananya.',
    'Mode gelap juga ada, lho. Rumah duka lebih cocok gelap, menurutku.'
  ],
  click: [
    'Boo! Kaget, kan? Ehehe~',
    'Aiya, jangan dicolek terus. Nanti kukenakan tarif... dan kuhantui.',
    'Pose seram begini cuma buat gaya. Ada yang mau ditanyakan? Jam kerjaku 24 jam.',
    'Mau jalan pintas? Geser ke bawah, itu jalannya. Uuuu~',
    'Hmm, kamu mirip arwah yang kebingungan. Tenang, menunya ada di atas.',
    'Satu klik, satu salam. Salam kenal dari Direktur Wangsheng! Boo!'
  ],
  clicks: {
    3:  ['Tiga kali! Ehehe, kamu mulai suka denganku ya. Aku sampai berkedip-kedip.'],
    7:  ['Tujuh kali! Aku yang menghitung, dan sudah kucatat di buku tamu Wangsheng. Hup!'],
    15: ['Lima belas klik! Aku sampai pusing berputar. Kamu tidak punya kegiatan lain, atau aku seistimewa itu?']
  },
  idle: [
    'Sepi ya... Aku buat puisi dulu. Kabel putus, hati tidak. Eh, kok pusing... bruk.',
    'Aku lemas... Kalau sudah selesai baca, kirim email ke Deni ya. Bruk.',
    'Masih ada yang belum kamu baca. Geser ke bawah, aku pingsan dulu, ehehe.',
    'Aku bosan sampai pingsan. Ayo klik aku, atau nyalakan musiknya.'
  ],
  offline: [
    'Yang ini sudah beristirahat. Kita doakan, lalu lanjut. Uuuu... tidak ada yang dilupakan di sini.',
    'Port padam bukan berarti gagal. Kadang proyek memang sudah selesai tugasnya.',
    'Aiya, proyek yang sudah tidak jalan. Aku jaga kenangannya, gratis. Uuuu~',
    'Tiap proyek pernah berguna, dan itu tidak hilang. Hidup juga begitu, kan?',
    'Yang di bawah ini tidur nyenyak. Jangan dibangunkan, kecuali Deni yang minta.'
  ],
  kontak: [
    'Mau menghubungi Deni? Semua jalur ada di sini. Pilih satu, aku pura-pura tidak lihat. Ehehe.',
    'Email paling cepat dibalas. Itu bocoran dari dalam, jangan bilang siapa-siapa. Kedip, kedip.',
    'Tenang, Deni tidak menggigit. Aku yang kadang-kadang.'
  ],
  audioOn: [
    'Musik menyala! Aku sampai berputar-putar. Ehehe.',
    'Musiknya jalan. Kalau tiba-tiba merinding, itu bukan aku. Wiii~',
    'Dengarkan baik-baik. Cocok buat menemani baca proyek Deni. Ayo berputar!'
  ],
  audioFail: [
    'Musik gagal dinyalakan. Format berkasnya mungkin tidak didukung. Aku lemas... bruk.'
  ],
  audioOff: [
    'Musiknya dimatikan. Sunyi juga punya keindahan, kata orang yang suka sunyi.',
    'Oke, sepi lagi. Sekarang aku bisa mendengar napasmu. Eh, bercanda.',
    'Hening itu bagus, kadang. Aku juga butuh jeda sesekali.'
  ],
  themeDark: [
    'Gelap! Nah, ini baru suasana rumah duka. Uuuu~ aku betah.',
    'Lampu dipadamkan. Kerlap-kerlip LED jadi lebih cantik, kan? Boo!',
    'Mode gelap menyala. Mata terlindungi, arwah pun lebih tenang. Uuuu...'
  ],
  themeLight: [
    'Terang lagi! Aku sampai berputar silau. Arwah-arwah mundur dulu.',
    'Mode terang. Cocok buat siang hari, dan buat memeriksa debu di rak. Wiii~',
    'Wah, terang sekali! Aku tidak keberatan, asal bukan jam tiga pagi.'
  ]
};

/* ---------- POSE ----------
   Tiap daftar kalimat dipasangkan dengan satu GIF di assets/img/mascot/.
   Daftar yang tidak ada di sini memakai 'idle'. */
const POSE_DIR = 'assets/img/mascot/';
const POSE_OF = new Map([
  [LINES.welcome,     'jumping'],
  [LINES.newProject,  'jumping'],
  [LINES.clicks[7],   'jumping'],
  [LINES.welcomeBack, 'blinking-eyes'],
  [LINES.kontak,      'blinking-eyes'],
  [LINES.clicks[3],   'blinking-eyes'],
  [LINES.click,       'spooky-pose'],
  [LINES.offline,     'spooky-pose'],
  [LINES.themeDark,   'spooky-pose'],
  [LINES.audioOn,     'spinning'],
  [LINES.themeLight,  'spinning'],
  [LINES.clicks[15],  'spinning'],
  [LINES.idle,        'faint'],
  [LINES.audioFail,   'faint']
]);
const mascotImg = document.getElementById('mascotImg');
let currentPose = 'idle';

function setPose(name = 'idle') {
  if (!mascotImg || reduced || name === currentPose) return;
  currentPose = name;
  mascotImg.src = POSE_DIR + 'hu-tao-' + name + '.gif';
}

/* ==================================================================
   3. GELOMBUNG
   ================================================================== */
const bubble      = document.getElementById('bubble');
const bubbleText  = document.getElementById('bubbleText');
const bubbleSay   = document.getElementById('bubbleSay');
const bubbleClose = document.getElementById('bubbleClose');
const dockPane    = document.getElementById('dockPanel');

let bubbleTimer = null;
let idleTimer   = null;
let activeLine  = null;

function pick(list) {
  /* hindari mengulang kalimat yang sedang tampil */
  const pool = list.filter(line => line !== activeLine);
  return (pool.length ? pool : list)[Math.floor(Math.random() * (pool.length || list.length))];
}

/* Hanya baris live region yang membacakan kalimat ke pembaca layar,
   dan hanya kalau kalimat itu muncul karena orang menekan sesuatu.
   Kalimat yang muncul sendiri sengaja diam, supaya tidak membazir. */
function announce(line) {
  if (!bubbleSay) return;
  bubbleSay.textContent = '';
  requestAnimationFrame(() => { bubbleSay.textContent = line; });
}

/* Gelembung boleh muncul di atas panel kontak: keduanya ditumpuk
   vertikal di dalam .dock, jadi tidak pernah saling menutupi. */
function panelIsOpen() {
  return !!(dockPane && !dockPane.hidden);
}

function say(list, ms = 7000, shouldAnnounce = false) {
  if (!bubble || !bubbleText || !list || !list.length) return;

  const line = pick(list);
  activeLine = line;
  setPose(POSE_OF.get(list) || 'idle');

  clearTimeout(bubbleTimer);
  bubbleText.textContent = fill(line);
  bubble.hidden = false;

  if (shouldAnnounce) announce(line);

  bubbleTimer = setTimeout(hide, ms);
}

function hide() {
  if (!bubble) return;
  clearTimeout(bubbleTimer);
  bubble.hidden = true;
  if (bubbleSay) bubbleSay.textContent = '';
  setPose('idle');
  activeLine = null;
}

function idle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!panelIsOpen()) say(LINES.idle);
  }, 32000);
}

if (bubbleClose) bubbleClose.addEventListener('click', hide);

/* badan gelembung juga menutup; tombol silangnya sendiri tetap di atas */
if (bubble) bubble.addEventListener('click', (e) => { if (!e.target.closest('.bubble-close')) hide(); });

/* ==================================================================
   4. LAYAR HIDUP
   ================================================================== */
const boot = document.getElementById('boot');

if (boot) {
  /* gambar jadi tampilan utama. Kalau gagal dimuat, atau gerak
     dikurangi, CSS menyembunyikannya dan LED susunan yang muncul. */
  const bootImg = boot.querySelector('.boot-video');
  if (bootImg && !reduced) {
    const ok = () => boot.classList.add('has-video');
    if (bootImg.complete && bootImg.naturalWidth > 0) ok();
    else bootImg.addEventListener('load', ok);
  }

  let visited = false, lastTotal = 0;
  try {
    visited = localStorage.getItem('visited') === '1';
    lastTotal = Number(localStorage.getItem('lastTotal')) || 0;
    localStorage.setItem('visited', '1');
    localStorage.setItem('lastTotal', String(entries.length));
  } catch (e) {}
  const welcomeList = !visited ? LINES.welcome : (entries.length > lastTotal ? LINES.newProject : LINES.welcomeBack);

  const PRELOAD = [
    'assets/img/mascot/hu-tao-spinning.gif',
    'assets/img/mascot/hu-tao-loading.gif',
    'assets/img/mascot/hu-tao-idle.gif',
    'assets/img/mascot/hu-tao-jumping.gif',
    'assets/img/mascot/hu-tao-blinking-eyes.gif',
    'assets/img/potrait.webp'
  ];
  const PRELOAD_BIG = [ // besar: dilewati kalau pengguna hemat data
    'assets/img/mascot/hu-tao-faint.gif',
    'assets/img/mascot/hu-tao-spooky-pose.gif'
  ];
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const assets = saveData ? PRELOAD : PRELOAD.concat(PRELOAD_BIG);
  const MIN_MS = reduced ? 200 : 900;  // cukup lama supaya layar tidak berkedip
  const MAX_MS = 8000;                 // jaringan lambat: lanjut, sisa unduhan jalan terus
  const bootLeds = [...boot.querySelectorAll('.boot-leds span')];
  let done = 0;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const warm = (src) => new Promise(res => {
    const im = new Image();
    im.onload = im.onerror = () => {
      done++;
      const n = Math.round(done / assets.length * bootLeds.length);
      bootLeds.forEach((s, i) => s.classList.toggle('on', i < n));
      res();
    };
    im.src = src;
  });
  // service worker dulu (maks 1,5 detik) supaya unduhan pertama ikut tersimpan di Cache Storage
  const swReady = ('serviceWorker' in navigator)
    ? Promise.race([navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready), wait(1500)]).catch(() => {})
    : Promise.resolve();
  const started = Date.now();
  const loaded = swReady.then(() => Promise.race([Promise.all(assets.map(warm)), wait(MAX_MS)]));

  setPose('loading');
  loaded
    .then(() => wait(Math.max(0, MIN_MS - (Date.now() - started))))
    .then(() => {
      if (boot.isConnected) boot.remove();
      say(welcomeList, 6500);
      idle();
    });
}

/* ==================================================================
   5. TEMA
   ================================================================== */
const themeBtn = document.getElementById('themeBtn');

function themeLabel() {
  const dark = document.documentElement.classList.contains('dark');
  themeBtn.setAttribute('aria-label', dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
}

themeLabel();

themeBtn.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
  themeLabel();
  say(dark ? LINES.themeDark : LINES.themeLight, 4500);
});

/* ==================================================================
   6. MUSIK
   ================================================================== */
const audio    = document.getElementById('bgAudio');
const audioBtn = document.getElementById('audioBtn');

audioBtn.addEventListener('click', () => {
  if (audio.paused) {
    setPose('loading');
    audio.play()
      .then(() => {
        audioBtn.setAttribute('aria-pressed', 'true');
        audioBtn.setAttribute('aria-label', 'Matikan musik latar');
        say(LINES.audioOn, 4500);
      })
      .catch(() => {
        audioBtn.setAttribute('aria-pressed', 'false');
        say(LINES.audioFail, 6500, true);
      });
  } else {
    audio.pause();
    audioBtn.setAttribute('aria-pressed', 'false');
    audioBtn.setAttribute('aria-label', 'Putar musik latar');
    say(LINES.audioOff, 4500);
  }
});

/* ==================================================================
   7. MENU DAN PANEL KONTAK
   ================================================================== */
const menuBtn  = document.getElementById('menuBtn');
const navList  = document.getElementById('navList');
const dockBtn  = document.getElementById('dockToggle');

function closeMenu() {
  navList.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.textContent = 'Menu';
}

menuBtn.addEventListener('click', () => {
  const open = navList.classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Tutup' : 'Menu';
});

navList.addEventListener('click', (e) => {
  if (e.target.closest('a')) closeMenu();
});

/* begitu layar cukup lebar untuk nav penuh, menu tidak usah terbuka */
matchMedia('(min-width: 720px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });

/* Di layar sempit gelembung akan menutupi panelnya, jadi di sana
   Hu Tao diam saja. Di layar lebar keduanya ditumpuk vertikal. */
dockBtn.addEventListener('click', () => {
  const open = dockPane.hidden;
  dockPane.hidden = !open;
  dockBtn.setAttribute('aria-expanded', String(open));

  if (!open) { hide(); return; }

  if (matchMedia('(min-width: 600px)').matches) say(LINES.kontak, 4500);
  else hide();
});

/* ==================================================================
   8. PEMILIH BAGIAN
   Satu pengamat untuk dua hal: menandai nav yang sedang dibaca, dan
   menyuruh Hu Tao bicara ketika pindah bagian.
   ================================================================== */
const areas = [...document.querySelectorAll('[data-spine]')];

let lastSection = null;

function markNav(id) {
  document.querySelectorAll('#navList a').forEach(a => {
    const on = a.getAttribute('href') === '#' + id;
    if (on) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

const areaObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    markNav(entry.target.id);

    /* baris nav untuk Tentang ada, tapi tidak ada di dalam section */
    if (entry.target.id !== lastSection) {
      lastSection = entry.target.id;
      const lines = LINES[entry.target.id];
      if (lines) say(lines);
    }
  });
}, { rootMargin: '-45% 0px -45% 0px' });

areas.forEach(area => areaObserver.observe(area));

/* proyek yang offline bicara sekali saja, saat masuk layar */
const offlineEntry = document.querySelector('.entry[data-state="offline"]');
if (offlineEntry) {
  const o = new IntersectionObserver((es) => {
    if (es[0].isIntersecting) { say(LINES.offline); o.disconnect(); }
  }, { rootMargin: '-45% 0px -45% 0px' });
  o.observe(offlineEntry);
}

/* ==================================================================
   9. NGOBROL SAMA HU TAO
   ================================================================== */
let clicks = 0;

document.getElementById('mascotBtn').addEventListener('click', () => {
  clicks++;
  say(LINES.clicks[clicks] || LINES.click);
  idle();
});

/* ==================================================================
   10. LAIN-LAIN
   ================================================================== */
/* Escape menutup semua yang terbuka */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  hide();
  closeMenu();
  if (dockPane && !dockPane.hidden) {
    dockPane.hidden = true;
    dockBtn.setAttribute('aria-expanded', 'false');
  }
});

/* ==================================================================
   11. CATATAN SEKALI-SEKALI
   ================================================================== */
setTimeout(() => {
  if (bubble && bubble.hidden) say(LINES.note, 6500);
}, 30000);

/* Penghalang salin untuk pengunjung awam. Tautan dikecualikan. */
const elOf = (n) => (n && n.nodeType === 3 ? n.parentElement : n);
const inLink = (n) => { const el = elOf(n); return !!(el && el.closest && el.closest('a')); };
document.addEventListener('contextmenu', (e) => { if (!inLink(e.target)) e.preventDefault(); });
document.addEventListener('selectstart', (e) => { if (!inLink(e.target)) e.preventDefault(); });
document.addEventListener('dragstart',   (e) => { if (!inLink(e.target)) e.preventDefault(); });
['copy', 'cut'].forEach((t) => document.addEventListener(t, (e) => {
  const s = window.getSelection();
  if (!s || !inLink(s.anchorNode)) e.preventDefault();
}));