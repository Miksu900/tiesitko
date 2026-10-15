// Tiesitkö? – staattinen sivugeneraattori. Käyttö: node build.mjs
// SITE_URL (esim. https://tiesitko.fi) asettaa oman verkkotunnuksen: silloin sivu on indeksoitavissa.
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";

const OUT = "dist";
const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const BASE = SITE ? "" : "/tiesitko";
const NAME = "Tiesitkö?";
const data = JSON.parse(await readFile("aiheet.json", "utf8"));
const kats = Object.fromEntries(data.kategoriat.map((k) => [k.id, k]));
const aiheet = data.aiheet;
const pvm = (iso) => iso.split("-").reverse().map((x) => String(+x)).join(".");
const PVM = pvm(data.tarkistettu);

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const url = (p) => `${BASE}${p}`;
const abs = (p) => `${SITE}${p}`;

const css = `
:root{--bg:#f3f5fa;--paper:#fff;--ink:#0b1b3a;--soft:#4a5875;--line:#dfe4ef;--blue:#0b2a6f;--hi:#ffd23f;--hi-ink:#3a2c00;--free:#0b7a5a;--free-bg:#dcf5ea;--due:#8a4b00;--due-bg:#ffeccc;--ring:#1b4fd8;
--c-tuet:#1b4fd8;--c-terveys:#0e9f6e;--c-kuluttaja:#e8590c;--c-velat:#8e3fd1;--c-verot:#c2185b;--c-tyo:#0891b2;--c-turva:#5b6475}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0a1226;--paper:#121c36;--ink:#eaf0ff;--soft:#a9b6d3;--line:#25335a;--blue:#0b2a6f;--hi-ink:#3a2c00;--free:#7ee2bc;--free-bg:#0d3a2e;--due:#ffc978;--due-bg:#3d2a0a;--ring:#8fb0ff}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:inherit}
:focus-visible{outline:3px solid var(--ring);outline-offset:2px;border-radius:4px}
.wrap{max-width:760px;margin:0 auto;padding:0 16px}
.wide{max-width:1080px}
.top{display:flex;align-items:center;justify-content:space-between;padding:14px 0}
.logo{font-weight:800;letter-spacing:-.02em;text-decoration:none;font-size:20px}
.logo b{background:var(--hi);color:var(--hi-ink);padding:0 6px;border-radius:5px;margin-left:2px}
.nav a{margin-left:16px;font-size:15px;color:var(--soft);text-decoration:none}
.nav a:hover{text-decoration:underline}
.hero{background:var(--blue);color:#fff;padding:8px 0 36px}
.hero .logo,.hero .nav a{color:#fff}
.hero h1{font-size:clamp(56px,16vw,120px);line-height:.95;letter-spacing:-.045em;margin:28px 0 14px;font-weight:900}
.hero h1 i{font-style:normal;color:var(--hi)}
.hero p{font-size:19px;max-width:30em;margin:0 0 22px;color:#d5e0ff}
.search{display:flex;gap:10px;flex-wrap:wrap}
.search input{flex:1 1 240px;font:inherit;font-size:18px;padding:15px 16px;border-radius:12px;border:2px solid transparent;background:#fff;color:#0b1b3a;min-width:0}
.btn{font:inherit;font-weight:700;border:0;border-radius:12px;padding:15px 18px;background:var(--hi);color:var(--hi-ink);cursor:pointer;text-decoration:none;display:inline-block}
.btn:hover{filter:brightness(.96)}
.btn.line{background:transparent;border:2px solid var(--line);color:var(--ink)}
.chips{display:flex;gap:8px;overflow-x:auto;padding:18px 16px 6px;margin:0 -16px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex:0 0 auto;font:inherit;font-size:15px;font-weight:600;padding:8px 14px;border-radius:999px;border:2px solid var(--line);background:var(--paper);color:var(--ink);cursor:pointer;white-space:nowrap}
.chip[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.count{color:var(--soft);font-size:15px;margin:10px 0 4px}
.grid{display:grid;gap:12px;grid-template-columns:1fr;padding:8px 0 40px;margin:0;list-style:none}
@media(min-width:640px){.grid{grid-template-columns:1fr 1fr}}
@media(min-width:960px){.grid{grid-template-columns:1fr 1fr 1fr}}
.card{display:flex;flex-direction:column;height:100%;background:var(--paper);border:1px solid var(--line);border-left:6px solid var(--c);border-radius:12px;padding:14px 16px 14px 14px;text-decoration:none}
.card:hover{border-color:var(--c);box-shadow:0 2px 0 var(--c)}
.card small{color:var(--soft);font-size:13px;font-weight:600}
.card h2,.page .card h2{font-size:19px;line-height:1.3;margin:4px 0 6px;letter-spacing:-.01em}
.card p{margin:0;color:var(--soft);font-size:15px;line-height:1.5}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:10px}
.tag{font-size:12.5px;font-weight:700;padding:2px 9px;border-radius:999px}
.tag.free{background:var(--free-bg);color:var(--free)}
.tag.due{background:var(--due-bg);color:var(--due)}
.empty{padding:28px 0;color:var(--soft)}
.crumb{display:inline-block;margin:6px 0 14px;color:var(--soft);font-size:15px}
.pill{display:inline-block;font-size:13px;font-weight:700;color:#fff;background:var(--c);padding:2px 10px;border-radius:999px;margin-left:8px;vertical-align:1px}
.page h1{font-size:clamp(28px,7vw,44px);line-height:1.15;letter-spacing:-.025em;margin:6px 0 16px;font-weight:850}
.lead{font-size:20px;line-height:1.5;padding:14px 16px;background:var(--paper);border-left:6px solid var(--hi);border-radius:0 12px 12px 0;margin:0 0 8px}
.page h2{font-size:22px;letter-spacing:-.015em;margin:32px 0 10px}
.facts{padding-left:22px;margin:0}
.facts li{margin:0 0 10px}
.steps{padding-left:0;margin:0;list-style:none;counter-reset:s}
.steps li{counter-increment:s;display:grid;grid-template-columns:34px 1fr;gap:10px;margin:0 0 12px;align-items:start}
.steps li::before{content:counter(s);width:30px;height:30px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font-weight:800;font-size:15px;margin-top:1px}
.note{margin:22px 0 0;padding:12px 14px;border-radius:10px;background:var(--due-bg);color:var(--ink);font-size:15.5px}
.source{margin:28px 0 0;padding:16px;border:2px solid var(--ink);border-radius:12px;background:var(--paper)}
.source h2{margin:0 0 6px;font-size:18px}
.source p{margin:0 0 12px;color:var(--soft);font-size:15px}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.rel{margin-top:40px}
.rel .grid{padding-bottom:10px}
.fine{color:var(--soft);font-size:14.5px;margin-top:24px}
footer{border-top:1px solid var(--line);margin-top:30px;padding:22px 0 40px;color:var(--soft);font-size:14.5px}
footer a{margin-right:14px}
.prose p,.prose li{max-width:40em}
@media(prefers-reduced-motion:no-preference){.card{transition:box-shadow .12s,border-color .12s}}
`;

const js = `
(function(){
  var q=document.getElementById('q'),list=document.getElementById('lista');
  if(q&&list){
    var cards=[].slice.call(list.children),chips=[].slice.call(document.querySelectorAll('.chip')),
    cnt=document.getElementById('maara'),empty=document.getElementById('tyhja'),kat='',free=false;
    var norm=function(s){return s.toLowerCase().trim()};
    function run(){
      var t=norm(q.value),n=0;
      cards.forEach(function(c){
        var ok=(!kat||c.dataset.kat===kat)&&(!free||c.dataset.free==='1')&&(!t||norm(c.dataset.t).indexOf(t)>-1);
        c.hidden=!ok;if(ok)n++;
      });
      cnt.textContent=n+(n===1?' aihe':' aihetta');
      empty.hidden=n>0;
    }
    q.addEventListener('input',run);
    chips.forEach(function(b){b.addEventListener('click',function(){
      if(b.dataset.free){free=!free;b.setAttribute('aria-pressed',free)}
      else{kat=b.dataset.kat;chips.forEach(function(x){if(!x.dataset.free)x.setAttribute('aria-pressed',x===b)})}
      run();
    })});
    var r=document.getElementById('arvo');
    if(r)r.addEventListener('click',function(){
      var v=cards.filter(function(c){return !c.hidden});if(!v.length)v=cards;
      location.href=v[Math.floor(Math.random()*v.length)].querySelector('a').href;
    });
    run();
  }
  var s=document.getElementById('jaa');
  if(s)s.addEventListener('click',function(){
    var d={title:document.title,url:location.href};
    if(navigator.share){navigator.share(d).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(d.url).then(function(){s.textContent='Linkki kopioitu'})}
  });
})();
`;

const head = (title, desc, path, extra = "") => `<!doctype html>
<html lang="fi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${SITE ? `<link rel="canonical" href="${abs(path)}">` : `<meta name="robots" content="noindex">`}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:locale" content="fi_FI">
${SITE ? `<meta property="og:image" content="${abs("/og.png")}"><meta property="og:url" content="${abs(path)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b2a6f">
<link rel="stylesheet" href="${url("/style.css")}">${extra}
</head><body>`;

const foot = `<footer><div class="wrap wide">
<p><a href="${url("/")}">Kaikki aiheet</a><a href="${url("/tietoa/")}">Näin tämä sivu toimii</a><a href="https://github.com/Miksu900/tiesitko/issues/new" rel="noopener">Ilmoita virheestä</a></p>
<p>${NAME} kokoaa yleistietoa viranomaisten omilta sivuilta. Se ei ole viranomainen eikä anna oikeudellista, verotuksellista tai lääketieteellistä neuvontaa. Tarkista aina ajantasainen tieto lähteestä ennen päätöksiä. Tiedot tarkistettu ${PVM}.</p>
</div></footer><script src="${url("/app.js")}" defer></script></body></html>`;

const topbar = (cls = "") => `<div class="wrap wide"><div class="top"><a class="logo" href="${url("/")}">Tiesitkö<b>?</b></a><nav class="nav"><a href="${url("/tietoa/")}">Näin tämä toimii</a></nav></div></div>`;

const tags = (a) => {
  const t = [];
  if (a.merkit?.includes("Maksuton")) t.push(`<span class="tag free">Maksuton</span>`);
  if (a.merkit?.includes("Määräaika")) t.push(`<span class="tag due">Huomaa määräaika</span>`);
  return t.length ? `<div class="tags">${t.join("")}</div>` : "";
};

const card = (a) => `<li class="cardli" data-kat="${a.kat}" data-free="${a.merkit?.includes("Maksuton") ? 1 : 0}" data-t="${esc([a.otsikko, a.lyhyesti, ...a.faktat].join(" "))}"><a class="card" style="--c:var(--c-${a.kat})" href="${url(`/aihe/${a.slug}/`)}"><small>${esc(kats[a.kat].nimi)}</small><h2>${esc(a.otsikko)}</h2><p>${esc(a.lyhyesti)}</p>${tags(a)}</a></li>`;

await rm(OUT, { recursive: true, force: true });
await mkdir(`${OUT}/aihe`, { recursive: true });
await mkdir(`${OUT}/tietoa`, { recursive: true });
await writeFile(`${OUT}/style.css`, css);
await writeFile(`${OUT}/app.js`, js);
await writeFile(`${OUT}/.nojekyll`, "");

// Etusivu
const chips = [`<button class="chip" data-kat="" aria-pressed="true">Kaikki</button>`]
  .concat(data.kategoriat.map((k) => `<button class="chip" data-kat="${k.id}" aria-pressed="false">${esc(k.nimi)}</button>`))
  .concat([`<button class="chip" data-free="1" aria-pressed="false">Vain maksuttomat</button>`]).join("");
const index = `${head(`${NAME} ${aiheet.length} asiaa, jotka kannattaa tietää`, `Tuet, oikeudet ja ilmaiset palvelut, joista moni suomalainen ei tiedä. Jokaisella aiheella virallinen lähde.`, "/")}
<header class="hero"><div class="wrap wide">${topbar()}
<h1>Tiesitkö<i>?</i></h1>
<p>${aiheet.length} asiaa, jotka kannattaa tietää: tukia, oikeuksia ja ilmaisia palveluja. Jokaisella on virallinen lähde.</p>
<div class="search"><input id="q" type="search" placeholder="Hae esimerkiksi asumistuki tai reklamaatio" aria-label="Hae aiheista" autocomplete="off"><button class="btn" id="arvo" type="button">Yllätä minut</button></div>
</div></header>
<main class="wrap wide"><div class="chips" role="group" aria-label="Rajaa aiheita">${chips}</div>
<p class="count" id="maara" aria-live="polite"></p>
<ul class="grid" id="lista">${aiheet.map(card).join("")}</ul>
<p class="empty" id="tyhja" hidden>Ei osumia. Kokeile lyhyempää hakusanaa tai valitse ”Kaikki”.</p>
</main>${foot}`;
await writeFile(`${OUT}/index.html`, index);

// Aihesivut
for (const a of aiheet) {
  const rel = aiheet.filter((b) => b.kat === a.kat && b.slug !== a.slug).slice(0, 3);
  const dir = `${OUT}/aihe/${a.slug}`;
  await mkdir(dir, { recursive: true });
  const lis = [a.lahde, ...(a.lisalahteet || [])];
  const html = `${head(`${a.otsikko} | ${NAME}`, a.lyhyesti, `/aihe/${a.slug}/`)}
<div class="wrap">${topbar()}</div>
<main class="wrap page" style="--c:var(--c-${a.kat})">
<a class="crumb" href="${url("/")}">← Kaikki aiheet</a><span class="pill">${esc(kats[a.kat].nimi)}</span>
<h1>${esc(a.otsikko)}</h1>
<p class="lead">${esc(a.lyhyesti)}</p>
${tags(a)}
<h2>Hyvä tietää</h2>
<ul class="facts">${a.faktat.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
<h2>Näin teet</h2>
<ol class="steps">${a.toimi.map((f) => `<li><span>${esc(f)}</span></li>`).join("")}</ol>
${a.huom ? `<p class="note"><strong>Huomaa:</strong> ${esc(a.huom)}</p>` : ""}
<aside class="source"><h2>Virallinen lähde</h2>
<p>Tiedot on luettu viranomaisen sivulta ${PVM}. Säännöt ja summat voivat muuttua, joten tarkista ajantasainen tieto lähteestä.</p>
${lis.map((l, i) => `<a class="btn${i ? " line" : ""}" href="${esc(l.url)}" rel="noopener" target="_blank">${esc(l.nimi)}</a>`).join(" ")}
</aside>
<div class="actions"><button class="btn line" id="jaa" type="button">Jaa tämä</button></div>
<p class="fine">Tämä on yleistietoa, ei henkilökohtaista neuvontaa. Kysy epäselvissä tilanteissa asiaa viranomaiselta.</p>
${rel.length ? `<section class="rel"><h2>Lisää aiheesta ${esc(kats[a.kat].nimi.toLowerCase())}</h2><ul class="grid">${rel.map(card).join("")}</ul></section>` : ""}
</main>${foot}`;
  await writeFile(`${dir}/index.html`, html);
}

// Tietoa
const tietoa = `${head(`Näin tämä sivu toimii | ${NAME}`, `Miten ${NAME} kokoaa ja tarkistaa tietonsa.`, "/tietoa/")}
<div class="wrap">${topbar()}</div>
<main class="wrap page prose">
<a class="crumb" href="${url("/")}">← Kaikki aiheet</a>
<h1>Näin tämä sivu toimii</h1>
<p class="lead">Jokainen tieto tulee viranomaisen omalta sivulta, ja jokaisen aiheen alla on linkki lähteeseen.</p>
<h2>Mitä sivu tekee</h2>
<p>${NAME} kertoo lyhyesti ja selkeästi tuista, oikeuksista ja ilmaisista palveluista, joista moni ei tiedä. Tarkoitus on herättää kysymys ja ohjata sinut oikealle viranomaiselle.</p>
<h2>Miten tiedot tarkistetaan</h2>
<ul>
<li>Tiedot luetaan viranomaisten omilta sivuilta, kuten Kela, Verohallinto, KKV, STM, Traficom ja DVV.</li>
<li>Euromääriä ja päivämääriä kerrotaan vain, jos viranomaisen sivu näyttää ne. Vuosi mainitaan, kun sivu kertoo sen.</li>
<li>Jos lähteen sivu ei kerro jotain, sitä ei kerrota tässäkään. Epävarmat kohdat on merkitty ”Huomaa”-laatikkoon.</li>
<li>Tiedot on tarkistettu viimeksi ${PVM}.</li>
</ul>
<h2>Mitä sivu ei ole</h2>
<p>Tämä ei ole viranomaisen sivu, eikä se anna oikeudellista, verotuksellista tai lääketieteellistä neuvontaa. Säännöt muuttuvat, ja oma tilanteesi voi poiketa yleiskuvauksesta. Tarkista aina ajantasainen tieto lähteestä.</p>
<h2>Löysitkö virheen?</h2>
<p>Kerro siitä <a href="https://github.com/Miksu900/tiesitko/issues/new" rel="noopener">tästä</a>, niin korjaamme sen.</p>
</main>${foot}`;
await writeFile(`${OUT}/tietoa/index.html`, tietoa);

// 404
await writeFile(`${OUT}/404.html`, `${head(`Sivua ei löytynyt | ${NAME}`, "Sivua ei löytynyt.", "/404.html")}
<div class="wrap">${topbar()}</div><main class="wrap page"><h1>Tätä sivua ei löytynyt</h1><p class="lead">Linkki voi olla vanhentunut.</p><p><a class="btn" href="${url("/")}">Katso kaikki aiheet</a></p></main>${foot}`);

if (SITE) {
  const urls = ["/", "/tietoa/", ...aiheet.map((a) => `/aihe/${a.slug}/`)];
  await writeFile(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${abs(u)}</loc><lastmod>${data.tarkistettu}</lastmod></url>`).join("")}</urlset>`);
  await writeFile(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${abs("/sitemap.xml")}\n`);
  await writeFile(`${OUT}/CNAME`, new URL(SITE).hostname + "\n");
}
console.log(`Valmis: ${aiheet.length} aihetta, ${SITE ? SITE : "ei omaa verkkotunnusta (noindex)"}`);
