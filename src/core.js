// Tiesitkö? – jaettu pelitila selaimessa (localStorage). Data: window.TKDATA (build.mjs lisää).
(function () {
  var D = window.TKDATA || { kats: [], n: 0 };
  var TK = (window.TK = { D: D });
  TK.get = function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  TK.put = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  TK.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  TK.today = function () { return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Helsinki" }); };
  TK.prev = function (s) { var p = s.split("-"), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] - 1)); return d.toISOString().slice(0, 10); };
  TK.dayNo = function (s) { var p = s.split("-"); return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(2026, 9, 15)) / 864e5) + 1; };
  TK.rnd = function (str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    var a = h >>> 0;
    return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  TK.shuffle = function (arr, r) { r = r || Math.random; var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  TK.ok = function (slug) { var o = TK.get("tk-ok", []); if (o.indexOf(slug) < 0) { o.push(slug); TK.put("tk-ok", o); } };
  TK.lit = function () { var m = {}, st = TK.get("tk1", {}), ok = TK.get("tk-ok", []); for (var k in st) m[k] = 1; ok.forEach(function (s) { m[s] = 1; }); return m; };
  TK.litCount = function () { return Object.keys(TK.lit()).length; };
  TK.stats = function () { var s = TK.get("tk-stats", {}); return { rounds: s.rounds || 0, perfect: s.perfect || 0, daily: s.daily || 0, blitz: s.blitz || 0, dperfect: s.dperfect || 0 }; };
  TK.setStats = function (s) { TK.put("tk-stats", s); };
  TK.streak = function () {
    var d = TK.get("tk-daily", {}), c = TK.today(), n = 0;
    if (!d[c]) c = TK.prev(c);
    while (d[c]) { n++; c = TK.prev(c); }
    return n;
  };
  TK.catDone = function (k) { var m = TK.lit(); return k.slugs.every(function (s) { return m[s]; }); };

  // Merkit
  var B = [
    ["eka", "Ensimmäinen kierros", "Pelaa yksi kisakierros.", function (c) { return c.s.rounds >= 1; }],
    ["taydellinen", "Täydellinen kierros", "Vastaa kaikkiin 10 oikein kisakierroksella.", function (c) { return c.s.perfect >= 1; }],
    ["haaste1", "Päivän haastaja", "Tee ensimmäinen päivän haaste.", function (c) { return c.s.daily >= 1; }],
    ["putki3", "Kolmen päivän putki", "Tee päivän haaste kolmena päivänä peräkkäin.", function (c) { return c.streak >= 3; }],
    ["putki7", "Viikon putki", "Tee päivän haaste seitsemänä päivänä peräkkäin.", function (c) { return c.streak >= 7; }],
    ["putki30", "Kuukauden putki", "Tee päivän haaste 30 päivänä peräkkäin.", function (c) { return c.streak >= 30; }],
    ["viisi", "Viisi viidestä", "Vastaa päivän haasteen kaikkiin kysymyksiin oikein.", function (c) { return c.s.dperfect >= 1; }],
    ["blitz10", "Nopea", "Saa aikahaasteessa vähintään 10 oikein.", function (c) { return c.s.blitz >= 10; }],
    ["blitz20", "Salamannopea", "Saa aikahaasteessa vähintään 20 oikein.", function (c) { return c.s.blitz >= 20; }],
    ["tahdet10", "Kymmenen tähteä", "Sytytä taivaalle 10 tähteä.", function (c) { return c.lit >= 10; }],
    ["tahdet25", "Puoli taivasta", "Sytytä taivaalle 25 tähteä.", function (c) { return c.lit >= 25; }],
    ["tahdet50", "Koko taivas", "Sytytä kaikki tähdet.", function (c) { return c.lit >= c.n; }]
  ];
  D.kats.forEach(function (k) { B.push(["kuvio-" + k.id, k.nimi + ": tähtikuvio", "Sytytä kaikki tähdet kategoriassa " + k.nimi + ".", function (c) { return c.done[k.id]; }]); });
  TK.badges = B.map(function (b) { return { id: b[0], nimi: b[1], kuvaus: b[2] }; });
  TK.check = function () {
    var have = TK.get("tk-badges", {}), c = { s: TK.stats(), streak: TK.streak(), lit: TK.litCount(), n: D.n, done: {} }, fresh = [];
    D.kats.forEach(function (k) { c.done[k.id] = TK.catDone(k); });
    B.forEach(function (b) { if (!have[b[0]] && b[3](c)) { have[b[0]] = TK.today(); fresh.push(b[1]); } });
    if (fresh.length) { TK.put("tk-badges", have); TK.toast("Uusi merkki: " + fresh.join(", ")); TK.confetti(); }
    return fresh;
  };

  // Ilmoitus ja konfetti
  TK.toast = function (msg) {
    var t = document.getElementById("tk-toast");
    if (!t) { t = document.createElement("div"); t.id = "tk-toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on"); clearTimeout(TK._t);
    TK._t = setTimeout(function () { t.classList.remove("on"); }, 3600);
  };
  TK.confetti = function () {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var c = document.createElement("canvas"); c.className = "confetti"; c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
    var x = c.getContext("2d"), cols = ["#ffd23f", "#1b4fd8", "#0e9f6e", "#e8590c", "#c2185b", "#8e3fd1"], p = [];
    for (var i = 0; i < 140; i++) p.push({ x: c.width / 2 + (Math.random() - 0.5) * 120, y: c.height * 0.55, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 15 - 5, r: Math.random() * 6 + 3, c: cols[i % cols.length], a: Math.random() * 6 });
    var t0 = Date.now();
    (function f() {
      var dt = Date.now() - t0; x.clearRect(0, 0, c.width, c.height);
      p.forEach(function (q) { q.vy += 0.4; q.x += q.vx; q.y += q.vy; q.a += 0.2; x.save(); x.translate(q.x, q.y); x.rotate(q.a); x.fillStyle = q.c; x.globalAlpha = Math.max(0, 1 - dt / 2400); x.fillRect(-q.r, -q.r / 2, q.r * 2, q.r); x.restore(); });
      if (dt < 2400) requestAnimationFrame(f); else c.remove();
    })();
  };
  TK.share = function (btn, text) {
    var d = { title: document.title, text: text, url: location.href.split("#")[0] };
    if (navigator.share) navigator.share(d).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text + "\n" + d.url).then(function () { var o = btn.textContent; btn.textContent = "Kopioitu"; setTimeout(function () { btn.textContent = o; }, 1800); });
  };

  // Täytä pelaa-ruudukon dynaamiset kohdat
  document.addEventListener("DOMContentLoaded", function () {
    var q = function (k) { return document.querySelector('[data-tk="' + k + '"]'); };
    var d = TK.get("tk-daily", {}), t = TK.today(), s = TK.streak(), e;
    if ((e = q("daily"))) e.textContent = d[t] ? "Tehty tänään: " + d[t].s + "/5" + (s > 1 ? " · putki " + s + " pv" : "") : s ? "Putki " + s + " pv. Tee tämän päivän haaste." : "Uusi haaste odottaa.";
    if ((e = q("stars"))) e.textContent = TK.litCount() + "/" + D.n + " tähteä palaa";
    if ((e = q("blitz"))) { var b = TK.stats().blitz; e.textContent = b ? "Ennätyksesi: " + b : "60 sekuntia. Kuinka monta ehdit?"; }
  });
})();
