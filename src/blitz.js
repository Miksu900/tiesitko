(function () {
  var D = TK.D, root = document.getElementById("blitz"), esc = TK.esc;
  function intro() {
    var b = TK.stats().blitz;
    root.innerHTML = '<div class="kcard"><p>Vastaa mahdollisimman moneen kysymykseen 60 sekunnissa. Väärä vastaus vie 3 sekuntia.</p>' + (b ? '<p class="kfine">Ennätyksesi: ' + b + " oikein</p>" : "") + '<button class="btn" id="go" type="button">Aloita</button></div>';
    document.getElementById("go").onclick = play;
  }
  function play() {
    var qs = TK.shuffle(D.q), i = 0, ok = 0, end = Date.now() + 60000, busy = false, tm;
    function tick() { var l = Math.max(0, end - Date.now()), el = document.getElementById("bt"); if (el) { el.textContent = Math.ceil(l / 1000) + " s"; document.getElementById("bbar").style.width = l / 600 + "%"; } if (l <= 0) finish(); }
    function show() {
      if (i >= qs.length) { qs = TK.shuffle(D.q); i = 0; }
      var q = qs[i], o = TK.shuffle([q.o].concat(q.v)); busy = false;
      root.innerHTML = '<div class="kcard"><div class="kmeta"><span id="bt">60 s</span><span>' + ok + ' oikein</span></div><div class="bar"><i id="bbar" style="width:100%"></i></div><h2 class="kq">' + esc(q.k) + '</h2><div class="kopts">' +
        o.map(function (x, n) { return '<button class="kopt" type="button" data-i="' + n + '">' + esc(x) + "</button>"; }).join("") + "</div></div>";
      tick();
      [].forEach.call(root.querySelectorAll(".kopt"), function (b) {
        b.onclick = function () {
          if (busy) return; busy = true;
          var good = o[+b.dataset.i] === q.o;
          if (good) { ok++; TK.ok(q.s); } else { end -= 3000; b.classList.add("vaarin"); [].forEach.call(root.querySelectorAll(".kopt"), function (x) { if (o[+x.dataset.i] === q.o) x.classList.add("oikein"); }); }
          i++; setTimeout(function () { if (Date.now() < end) show(); }, good ? 120 : 800);
        };
      });
    }
    tm = setInterval(tick, 100);
    function finish() {
      clearInterval(tm);
      var st = TK.stats(), rec = ok > st.blitz; if (rec) st.blitz = ok; st.rounds += 0; TK.setStats(st);
      var txt = "Tiesitkö-aikahaaste: " + ok + " oikein 60 sekunnissa. Ehditkö enemmän?";
      root.innerHTML = '<div class="kcard"><h2 class="kq">' + ok + " oikein</h2><p>" + (rec && ok > 0 ? "Uusi ennätys!" : "Ennätyksesi: " + st.blitz) + '</p><div class="actions"><button class="btn" id="taas" type="button">Uudestaan</button><button class="btn line" id="jaa" type="button">Jaa tulos</button></div></div>';
      document.getElementById("taas").onclick = play; document.getElementById("jaa").onclick = function () { TK.share(this, txt); };
      TK.check(); if (rec && ok >= 10) TK.confetti();
    }
    show();
  }
  intro();
})();
