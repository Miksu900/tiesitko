(function () {
  var D = TK.D, NS = "http://www.w3.org/2000/svg", root = document.getElementById("taivas"), info = document.getElementById("tinfo"), esc = TK.esc;
  var C = [[95, 95], [265, 95], [95, 255], [265, 255], [95, 415], [265, 415], [180, 560]];
  var col = { tuet: "#6ea8ff", terveys: "#5eead4", kuluttaja: "#ffd23f", velat: "#ff9f7a", verot: "#c4a1ff", tyo: "#8fe388", turva: "#ff8fb8" };
  var lit = TK.lit(), byslug = {}; D.a.forEach(function (a) { byslug[a.s] = a; });
  var html = '<svg viewBox="0 0 360 620" role="img" aria-label="Tietotaivas: jokainen tähti on yksi aihe">';
  html += '<defs><radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
  var bg = TK.rnd("tausta");
  for (var i = 0; i < 70; i++) html += '<circle cx="' + (bg() * 360).toFixed(1) + '" cy="' + (bg() * 620).toFixed(1) + '" r="' + (bg() * 0.9 + 0.3).toFixed(1) + '" fill="#fff" opacity="' + (bg() * 0.35 + 0.1).toFixed(2) + '"/>';
  D.kats.forEach(function (k, ki) {
    var c = C[ki], r = TK.rnd("kuvio-" + k.id), n = k.slugs.length, pts = k.slugs.map(function (s, j) {
      var a = (j / n) * Math.PI * 2 + (r() - 0.5) * 0.5, d = 34 + r() * 30;
      return { s: s, x: c[0] + Math.cos(a) * d, y: c[1] + Math.sin(a) * d * 0.9, a: a };
    }).sort(function (p, q) { return p.a - q.a; });
    var done = TK.catDone(k), cc = col[k.id] || "#fff", cnt = k.slugs.filter(function (s) { return lit[s]; }).length;
    for (var j = 0; j < n; j++) {
      var p = pts[j], q = pts[(j + 1) % n], on = lit[p.s] && lit[q.s];
      html += '<line x1="' + p.x.toFixed(1) + '" y1="' + p.y.toFixed(1) + '" x2="' + q.x.toFixed(1) + '" y2="' + q.y.toFixed(1) + '" stroke="' + cc + '" stroke-width="' + (done ? 1.6 : 1) + '" opacity="' + (on ? (done ? 0.95 : 0.55) : 0.1) + '"/>';
    }
    pts.forEach(function (p) {
      var on = lit[p.s];
      html += '<g class="st' + (on ? " on" : "") + '" data-s="' + p.s + '" tabindex="0" role="button" aria-label="' + esc(byslug[p.s].t) + (on ? ", sytytetty" : ", ei vielä sytytetty") + '">';
      if (on) html += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="10" fill="url(#g)" opacity=".55"/>';
      html += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (on ? 3.6 : 2.2) + '" fill="' + (on ? cc : "#51608a") + '"/><circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="15" fill="transparent"/></g>';
    });
    html += '<text x="' + c[0] + '" y="' + (c[1] + 84) + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + (done ? cc : "#9fb0d8") + '">' + esc(k.nimi) + " " + cnt + "/" + n + (done ? " ✦" : "") + "</text>";
  });
  root.innerHTML = html + "</svg>";
  var all = TK.litCount(), xp = +(localStorage.getItem("tk-xp") || 0);
  document.getElementById("tsum").textContent = all + "/" + D.n + " tähteä palaa" + (all === D.n ? ". Koko taivas loistaa!" : ".");
  function pick(el) {
    var a = byslug[el.getAttribute("data-s")], on = lit[a.s];
    info.innerHTML = '<div class="kcard"><strong>' + esc(a.t) + "</strong><p class=\"kfine\">" + (on ? "Tämä tähti palaa." : "Tämä tähti ei pala vielä. Lue aihe ja paina ”Tiesin” tai ”En tiennyt”, tai vastaa kysymykseen oikein kisassa.") + '</p><a class="btn small" href="' + a.u + '">Lue aihe</a></div>';
  }
  [].forEach.call(root.querySelectorAll(".st"), function (g) {
    g.addEventListener("click", function () { pick(g); });
    g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(g); } });
  });
  var have = TK.get("tk-badges", {});
  document.getElementById("merkit").innerHTML = TK.badges.map(function (b) {
    var on = have[b.id];
    return '<li class="mk' + (on ? " on" : "") + '"><strong>' + esc(b.nimi) + "</strong><span>" + esc(b.kuvaus) + "</span></li>";
  }).join("");
  TK.check();
})();
