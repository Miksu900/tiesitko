(function () {
  var D = TK.D, t = TK.today(), no = TK.dayNo(t), root = document.getElementById("haaste"), esc = TK.esc;
  var r = TK.rnd("haaste-" + t), qs = TK.shuffle(D.q, r).slice(0, 5);
  var opts = qs.map(function (q) { return TK.shuffle([q.o].concat(q.v), r); });
  function cal() {
    var d = TK.get("tk-daily", {}), c = t, out = [];
    for (var i = 0; i < 14; i++) { out.unshift('<i class="' + (d[c] ? "on" : "") + '" title="' + c + '"></i>'); c = TK.prev(c); }
    return '<div class="cal" aria-label="Viimeiset 14 päivää">' + out.join("") + "</div>";
  }
  function left() {
    var n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), s = Math.max(0, Math.floor((m - n) / 1000));
    return Math.floor(s / 3600) + " h " + Math.floor((s % 3600) / 60) + " min";
  }
  function result(rec, fresh) {
    var st = TK.streak(), wrong = qs.filter(function (q, i) { return rec.m.charAt(i) !== "G"; });
    var grid = rec.m.split("").map(function (c) { return c === "G" ? "🟩" : "🟥"; }).join("");
    var txt = "Tiesitkö-haaste #" + no + " " + rec.s + "/5\n" + grid + (st > 1 ? "\nPutki: " + st + " pv" : "");
    root.innerHTML = '<div class="kcard"><h2 class="kq">' + rec.s + "/5</h2><p class=\"grid5\">" + grid + "</p>" +
      '<p class="lvl"><strong>Putki ' + st + " pv</strong></p>" + cal() +
      '<p class="kfine">Seuraava haaste tulee keskiyöllä (noin ' + left() + " päästä).</p>" +
      (wrong.length ? "<h3>Kertaa nämä</h3><ul class=\"kerta\">" + wrong.map(function (q) { return '<li><a href="' + q.u + '">' + esc(q.t) + "</a></li>"; }).join("") + "</ul>" : '<p class="hyva">Täydellinen. Kaikki viisi oikein.</p>') +
      '<div class="actions"><button class="btn" id="jaa" type="button">Jaa tulos</button><a class="btn line" href="' + D.base + '/blitz/">Aikahaaste</a></div></div>';
    document.getElementById("jaa").onclick = function () { TK.share(this, txt); };
  }
  var done = TK.get("tk-daily", {});
  if (done[t]) { document.getElementById("hno").textContent = "#" + no; return result(done[t]); }
  document.getElementById("hno").textContent = "#" + no;
  var i = 0, m = "", s = 0;
  function show() {
    var q = qs[i], o = opts[i];
    root.innerHTML = '<div class="kcard"><div class="kmeta"><span>Kysymys ' + (i + 1) + "/5</span><span>" + s + ' oikein</span></div><h2 class="kq">' + esc(q.k) + '</h2><div class="kopts">' +
      o.map(function (x, n) { return '<button class="kopt" type="button" data-i="' + n + '">' + esc(x) + "</button>"; }).join("") + '</div><div id="palaute" aria-live="polite"></div></div>';
    [].forEach.call(root.querySelectorAll(".kopt"), function (b) {
      b.onclick = function () {
        var good = o[+b.dataset.i] === q.o;
        [].forEach.call(root.querySelectorAll(".kopt"), function (x) { x.disabled = true; if (o[+x.dataset.i] === q.o) x.classList.add("oikein"); });
        if (good) { s++; TK.ok(q.s); } else b.classList.add("vaarin");
        m += good ? "G" : "R";
        document.getElementById("palaute").innerHTML = '<p class="' + (good ? "hyva" : "huono") + '"><strong>' + (good ? "Oikein." : "Ei aivan.") + "</strong> " + esc(q.e) + '</p><button class="btn" id="seur" type="button">' + (i < 4 ? "Seuraava" : "Näytä tulos") + "</button>";
        var n = document.getElementById("seur"); n.focus();
        n.onclick = function () { i++; if (i < 5) show(); else finish(); };
      };
    });
  }
  function finish() {
    var d = TK.get("tk-daily", {}); d[t] = { s: s, m: m }; TK.put("tk-daily", d);
    var st = TK.stats(); st.daily++; if (s === 5) st.dperfect++; TK.setStats(st);
    result(d[t], true); TK.check(); if (s === 5) TK.confetti();
  }
  show();
})();
