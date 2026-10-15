// Tiesitkö? – staattinen sivugeneraattori. Käyttö: node build.mjs
// SITE_URL (esim. https://tiesitko.fi) asettaa oman verkkotunnuksen: silloin sivu on indeksoitavissa.
import { mkdir, writeFile, readFile, rm, cp } from "node:fs/promises";

const OUT = "dist";
const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const BASE = SITE ? "" : "/tiesitko";
const NAME = "Tiesitkö?";
const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SB_KEY = process.env.SUPABASE_ANON_KEY || "";
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
.kisalink{display:block;margin:18px 0 0;padding:16px 18px;border-radius:14px;background:var(--ink);color:var(--bg);text-decoration:none}
.kisalink strong{display:block;font-size:19px;margin-bottom:2px}
.kisalink span{font-size:15px;opacity:.85}
.kcard{padding:18px;background:var(--paper);border:1px solid var(--line);border-radius:14px;margin-top:16px}
.lvl{font-size:17px}
.kfine{color:var(--soft);font-size:14.5px}
.kmeta{display:flex;justify-content:space-between;color:var(--soft);font-size:15px;font-weight:600}
.kq{font-size:clamp(21px,5.5vw,26px);line-height:1.3;margin:10px 0 14px;letter-spacing:-.015em}
.kopts{display:grid;gap:10px}
.kopt{font:inherit;text-align:left;padding:14px 16px;border-radius:12px;border:2px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer}
.kopt:hover:not(:disabled){border-color:var(--ring)}
.kopt:disabled{cursor:default}
.kopt.oikein{border-color:var(--free);background:var(--free-bg);color:var(--free);font-weight:700}
.kopt.vaarin{border-color:#c2185b;background:#fde4ee;color:#8c0f3f}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]) .kopt.vaarin{background:#3d1224;color:#ff9fc2}}
#palaute{margin-top:14px}
#palaute .hyva strong,.hyva{color:var(--free)}
#palaute .huono strong{color:#c2185b}
.kerta{padding-left:20px}
.rank{margin-top:30px}
.ranklist{list-style:none;padding:0;margin:0}
.ranklist li{display:grid;grid-template-columns:34px 1fr auto;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);background:var(--paper)}
.ranklist li:first-child{border-radius:12px 12px 0 0}
.ranklist em{font-style:normal;font-weight:700}
.lahetys{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.lahetys label{flex:1 0 100%;font-weight:700}
.lahetys input{flex:1 1 180px;font:inherit;padding:12px;border-radius:10px;border:2px solid var(--line);background:var(--bg);color:var(--ink);min-width:0}
.daily{display:block;margin:18px 0 0;padding:18px 20px;border-radius:16px;background:var(--hi);color:var(--hi-ink);text-decoration:none}
.daily small{font-weight:700;font-size:13px;opacity:.8}
.daily h2{margin:4px 0 8px;font-size:clamp(20px,5vw,26px);line-height:1.25;letter-spacing:-.015em}
.daily span{font-weight:700;font-size:15px;text-decoration:underline}
.score{margin:18px 0 0;padding:16px 18px;background:var(--paper);border:1px solid var(--line);border-radius:14px}
.score strong{font-size:22px}
.bar{height:8px;border-radius:99px;background:var(--line);margin:10px 0 12px;overflow:hidden}
.bar i{display:block;height:100%;width:0;background:var(--free);border-radius:99px}
.btn.small{padding:9px 14px;font-size:15px}
.cardli.known .card{opacity:.62}
.seen{font-size:12.5px;font-weight:700;color:var(--free);margin-top:8px}
.seen:empty{display:none}
.kysy{margin:22px 0 0;padding:16px;border:2px solid var(--line);border-radius:14px;background:var(--paper)}
.kysy h2{margin:0 0 10px;font-size:19px}
.kysy .row{display:flex;gap:10px;flex-wrap:wrap}
.kysy .btn[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.kysy .viesti{margin:12px 0 0;color:var(--soft);font-size:15.5px}
.kysy .viesti:empty{display:none}
.kysy #seuraava{margin-top:12px}
@media print{.hero,.chips,.kysy,.actions,.nav,.search,footer .wrap a{display:none!important}body{background:#fff;color:#000;font-size:12pt}a{text-decoration:none}}
@media(prefers-reduced-motion:no-preference){.card{transition:box-shadow .12s,border-color .12s}}
`;

const js = `
(function(){
  var KEY='tk1',st={};
  try{st=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){st={}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
  function counts(){var k=0,u=0;for(var x in st){if(st[x]===1)k++;else if(st[x]===0)u++}return{k:k,u:u}}
  function shareText(t){return 'Tiesin '+t.k+' asiaa 50:stä, ja opin '+t.u+' uutta. Entä sinä?'}
  function doShare(btn,text,url){
    var d={title:document.title,text:text,url:url};
    if(navigator.share){navigator.share(d).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(text+' '+url).then(function(){var o=btn.textContent;btn.textContent='Kopioitu';setTimeout(function(){btn.textContent=o},1800)})}
  }
  var q=document.getElementById('q'),list=document.getElementById('lista');
  if(q&&list){
    var cards=[].slice.call(list.children),chips=[].slice.call(document.querySelectorAll('.chip')),
    cnt=document.getElementById('maara'),empty=document.getElementById('tyhja'),kat='',free=false,uusi=false;
    var norm=function(s){return s.toLowerCase().trim()};
    var total=cards.length;
    function paint(){
      var t=counts();
      cards.forEach(function(c){
        var v=st[c.dataset.slug];c.classList.toggle('known',v===1);c.classList.toggle('learned',v===0);
        var b=c.querySelector('.seen');if(b)b.textContent=v===1?'Tiesin jo':v===0?'Opin uutta':'';
      });
      var sc=document.getElementById('tulos');
      if(sc){
        sc.hidden=(t.k+t.u)===0;
        document.getElementById('tn').textContent=t.k+t.u;
        document.getElementById('tk').textContent=t.k;
        document.getElementById('tu').textContent=t.u;
        document.getElementById('tbar').style.width=Math.round((t.k+t.u)/total*100)+'%';
      }
      var uc=document.getElementById('uchip');if(uc){uc.hidden=t.u===0;document.getElementById('un').textContent=t.u}
      var dp=document.getElementById('paiva');
      if(dp){
        var open=cards.filter(function(c){return st[c.dataset.slug]===undefined});
        if(!open.length){dp.hidden=true}
        else{
          var day=Math.floor(Date.now()/864e5),c=open[day%open.length],a=c.querySelector('a');
          dp.href=a.href;dp.querySelector('h2').textContent=a.querySelector('h2').textContent;dp.hidden=false;
        }
      }
    }
    function run(){
      var t=norm(q.value),n=0;
      cards.forEach(function(c){
        var ok=(!kat||c.dataset.kat===kat)&&(!free||c.dataset.free==='1')&&(!uusi||st[c.dataset.slug]===0)&&(!t||norm(c.dataset.t).indexOf(t)>-1);
        c.hidden=!ok;if(ok)n++;
      });
      cnt.textContent=n+(n===1?' aihe':' aihetta');
      empty.hidden=n>0;
    }
    q.addEventListener('input',run);
    chips.forEach(function(b){b.addEventListener('click',function(){
      if(b.dataset.free){free=!free;b.setAttribute('aria-pressed',free)}
      else if(b.dataset.uusi){uusi=!uusi;b.setAttribute('aria-pressed',uusi)}
      else{kat=b.dataset.kat;chips.forEach(function(x){if(!x.dataset.free&&!x.dataset.uusi)x.setAttribute('aria-pressed',x===b)})}
      run();
    })});
    var r=document.getElementById('arvo');
    if(r)r.addEventListener('click',function(){
      var v=cards.filter(function(c){return !c.hidden&&st[c.dataset.slug]===undefined});
      if(!v.length)v=cards.filter(function(c){return !c.hidden});if(!v.length)v=cards;
      location.href=v[Math.floor(Math.random()*v.length)].querySelector('a').href;
    });
    var js2=document.getElementById('jaatulos');
    if(js2)js2.addEventListener('click',function(){doShare(js2,shareText(counts()),location.href.split('#')[0])});
    var nol=document.getElementById('nollaa');
    if(nol)nol.addEventListener('click',function(){if(confirm('Nollataanko tuloksesi tällä laitteella?')){st={};save();paint();run()}});
    paint();run();
  }
  var pg=document.getElementById('kysy');
  if(pg){
    var slug=pg.dataset.slug,yes=document.getElementById('tiesin'),no=document.getElementById('eitiennyt'),
    msg=document.getElementById('kysyviesti'),nx=document.getElementById('seuraava'),all=JSON.parse(pg.dataset.kaikki);
    function show(){
      var v=st[slug];
      yes.setAttribute('aria-pressed',v===1);no.setAttribute('aria-pressed',v===0);
      if(v===undefined){msg.textContent='';nx.hidden=true;return}
      var t=counts();
      msg.textContent=(v===1?'Hyvä, tiesit tämän jo. ':'Nyt tiedät. ')+'Olet käynyt läpi '+(t.k+t.u)+'/'+all.length+' aihetta.';
      nx.hidden=false;
      var open=all.filter(function(x){return st[x.s]===undefined});
      if(!open.length){nx.textContent='Takaisin etusivulle';nx.href=pg.dataset.koti;return}
      var o=open[Math.floor(Math.random()*open.length)];nx.href=o.u;nx.textContent='Seuraava yllätys';
    }
    yes.addEventListener('click',function(){st[slug]=1;save();show()});
    no.addEventListener('click',function(){st[slug]=0;save();show()});
    show();
  }
  var s=document.getElementById('jaa');
  if(s)s.addEventListener('click',function(){doShare(s,'',location.href)});
})();
`;

const FAV = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Crect width=%2764%27 height=%2764%27 rx=%2714%27 fill=%27%230b2a6f%27/%3E%3Ctext x=%2732%27 y=%2748%27 font-size=%2742%27 font-weight=%27900%27 text-anchor=%27middle%27 fill=%27%23ffd23f%27 font-family=%27Arial,sans-serif%27%3E?%3C/text%3E%3C/svg%3E">`;
const head = (title, desc, path, extra = "", img = "/og/oletus.png") => `<!doctype html>
<html lang="fi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${SITE ? `<link rel="canonical" href="${abs(path)}">` : `<meta name="robots" content="noindex">`}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:locale" content="fi_FI">
${SITE ? `<meta property="og:image" content="${abs(img)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:image" content="${abs(img)}"><meta property="og:url" content="${abs(path)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b2a6f">
${FAV}
<link rel="stylesheet" href="${url("/style.css")}">${extra}
</head><body>`;

const foot = `<footer><div class="wrap wide">
<p><a href="${url("/")}">Kaikki aiheet</a><a href="${url("/kisa/")}">Kisa</a><a href="${url("/tietoa/")}">Näin tämä sivu toimii</a><a href="https://github.com/Miksu900/tiesitko/issues/new" rel="noopener">Ilmoita virheestä</a></p>
<p>${NAME} kokoaa yleistietoa viranomaisten omilta sivuilta. Se ei ole viranomainen eikä anna oikeudellista, verotuksellista tai lääketieteellistä neuvontaa. Tarkista aina ajantasainen tieto lähteestä ennen päätöksiä. Tiedot tarkistettu ${PVM}.</p>
</div></footer><script src="${url("/app.js")}" defer></script></body></html>`;

const topbar = (cls = "") => `<div class="wrap wide"><div class="top"><a class="logo" href="${url("/")}">Tiesitkö<b>?</b></a><nav class="nav"><a href="${url("/kisa/")}">Kisa</a><a href="${url("/tietoa/")}">Näin tämä toimii</a></nav></div></div>`;

const tags = (a) => {
  const t = [];
  if (a.merkit?.includes("Maksuton")) t.push(`<span class="tag free">Maksuton</span>`);
  if (a.merkit?.includes("Määräaika")) t.push(`<span class="tag due">Huomaa määräaika</span>`);
  return t.length ? `<div class="tags">${t.join("")}</div>` : "";
};

const card = (a) => `<li class="cardli" data-slug="${a.slug}" data-kat="${a.kat}" data-free="${a.merkit?.includes("Maksuton") ? 1 : 0}" data-t="${esc([a.otsikko, a.lyhyesti, ...a.faktat].join(" "))}"><a class="card" style="--c:var(--c-${a.kat})" href="${url(`/aihe/${a.slug}/`)}"><small>${esc(kats[a.kat].nimi)}</small><h2>${esc(a.otsikko)}</h2><p>${esc(a.lyhyesti)}</p>${tags(a)}<span class="seen" aria-live="polite"></span></a></li>`;

await rm(OUT, { recursive: true, force: true });
await mkdir(`${OUT}/aihe`, { recursive: true });
await mkdir(`${OUT}/tietoa`, { recursive: true });
await writeFile(`${OUT}/style.css`, css);
await writeFile(`${OUT}/app.js`, js);
await writeFile(`${OUT}/.nojekyll`, "");
await cp("og", `${OUT}/og`, { recursive: true });

// Etusivu
const chips = [`<button class="chip" data-kat="" aria-pressed="true">Kaikki</button>`]
  .concat(data.kategoriat.map((k) => `<button class="chip" data-kat="${k.id}" aria-pressed="false">${esc(k.nimi)}</button>`))
  .concat([`<button class="chip" data-free="1" aria-pressed="false">Vain maksuttomat</button>`, `<button class="chip" id="uchip" data-uusi="1" aria-pressed="false" hidden>Minulle uusia (<span id="un">0</span>)</button>`]).join("");
const index = `${head(`${NAME} ${aiheet.length} asiaa, jotka kannattaa tietää`, `Tuet, oikeudet ja ilmaiset palvelut, joista moni suomalainen ei tiedä. Jokaisella aiheella virallinen lähde.`, "/")}
<header class="hero"><div class="wrap wide">${topbar()}
<h1>Tiesitkö<i>?</i></h1>
<p>${aiheet.length} asiaa, jotka kannattaa tietää: tukia, oikeuksia ja ilmaisia palveluja. Jokaisella on virallinen lähde.</p>
<div class="search"><input id="q" type="search" placeholder="Hae esimerkiksi asumistuki tai reklamaatio" aria-label="Hae aiheista" autocomplete="off"><button class="btn" id="arvo" type="button">Yllätä minut</button></div>
</div></header>
<main class="wrap wide">
<a class="kisalink" href="${url("/kisa/")}"><strong>Tiesitkö-kisa</strong><span>10 kysymystä, putkibonus ja viikon ranking. Kuinka monta osaat?</span></a>
<a class="daily" id="paiva" href="#" hidden><small>Päivän yllätys</small><h2></h2><span>Lue lyhyesti</span></a>
<div class="score" id="tulos" hidden><div><strong><span id="tn">0</span>/${aiheet.length}</strong> aihetta käyty läpi · tiesit <b id="tk">0</b> · opit <b id="tu">0</b> uutta</div><div class="bar"><i id="tbar"></i></div><div class="actions"><button class="btn small" id="jaatulos" type="button">Jaa tuloksesi</button><button class="btn line small" id="nollaa" type="button">Nollaa</button></div></div>
<div class="chips" role="group" aria-label="Rajaa aiheita">${chips}</div>
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
  const html = `${head(`${a.otsikko} | ${NAME}`, a.lyhyesti, `/aihe/${a.slug}/`, SITE ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: a.otsikko, description: a.lyhyesti, inLanguage: "fi", dateModified: data.tarkistettu, image: abs(`/og/${a.slug}.png`), mainEntityOfPage: abs(`/aihe/${a.slug}/`), publisher: { "@type": "Organization", name: NAME } }).replace(/</g, "\\u003c")}</script>` : "", `/og/${a.slug}.png`)}
<div class="wrap">${topbar()}</div>
<main class="wrap page" style="--c:var(--c-${a.kat})" data-slug="${a.slug}">
<a class="crumb" href="${url("/")}">← Kaikki aiheet</a><span class="pill">${esc(kats[a.kat].nimi)}</span>
<h1>${esc(a.otsikko)}</h1>
<p class="lead">${esc(a.lyhyesti)}</p>
${tags(a)}
<section class="kysy" id="kysy" data-slug="${a.slug}" data-koti="${url("/")}" data-kaikki='${JSON.stringify(aiheet.map((b) => ({ s: b.slug, u: url(`/aihe/${b.slug}/`) }))).replace(/'/g, "&#39;")}'><h2>Tiesitkö tämän jo?</h2><div class="row"><button class="btn line" id="tiesin" type="button" aria-pressed="false">Tiesin</button><button class="btn line" id="eitiennyt" type="button" aria-pressed="false">En tiennyt</button></div><p class="viesti" id="kysyviesti" aria-live="polite"></p><a class="btn" id="seuraava" href="#" hidden>Seuraava yllätys</a></section>
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


// Kisa
await mkdir(`${OUT}/kisa`, { recursive: true });
const kisaData = aiheet.map((a) => ({ s: a.slug, t: a.otsikko, u: url(`/aihe/${a.slug}/`), k: a.kysymys.k, o: a.kysymys.o, v: a.kysymys.v, e: a.kysymys.s }));
const kisaCfg = JSON.stringify({ q: kisaData, sb: SB_URL && SB_KEY ? { url: SB_URL, key: SB_KEY } : null }).replace(/</g, "\\u003c");
await writeFile(`${OUT}/kisa.js`, `
(function(){
  var C=JSON.parse(document.getElementById('kisadata').textContent),Q=C.q,SB=C.sb;
  var $=function(i){return document.getElementById(i)};
  var LV=[[0,'Aloittelija'],[100,'Utelias'],[300,'Tietäjä'],[600,'Asiantuntija'],[1000,'Kansalaisviisas']];
  function get(k,d){try{var v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}}
  function put(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  var xp=+get('tk-xp',0),best=+get('tk-best',0),nick=get('tk-nick','');
  function level(x){var i=0;for(var j=0;j<LV.length;j++)if(x>=LV[j][0])i=j;return i}
  function week(){var d=new Date(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()));var n=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-n);var y=new Date(Date.UTC(d.getUTCFullYear(),0,1));var w=Math.ceil(((d-y)/864e5+1)/7);return d.getUTCFullYear()+'-W'+(w<10?'0':'')+w}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function hdr(){var h={apikey:SB.key};if(/^eyJ/.test(SB.key))h.Authorization='Bearer '+SB.key;return h}
  function lvlHtml(){
    var i=level(xp),nxt=LV[i+1],cur=LV[i][0];
    var pct=nxt?Math.round((xp-cur)/(nxt[0]-cur)*100):100;
    return '<div class="lvl"><strong>'+LV[i][1]+'</strong> · '+xp+' pistettä'+(nxt?' · seuraava taso '+nxt[1]+' ('+nxt[0]+' p)':'')+'</div><div class="bar"><i style="width:'+pct+'%"></i></div>';
  }
  var view=$('kisa');
  function start(){
    view.innerHTML='<div class="kcard">'+lvlHtml()+(best?'<p class="kfine">Paras kierroksesi: '+best+' pistettä</p>':'')+
      '<button class="btn" id="aloita" type="button">Aloita kierros (10 kysymystä)</button>'+
      '<p class="kfine">Oikea vastaus 10 pistettä. Kolmannesta peräkkäisestä oikeasta alkaen saat +5 putkibonuksen. Täydet pisteet: 140.</p></div>'+
      '<section class="rank"><h2>Viikon ranking</h2><div id="rank">Ladataan…</div><p class="kfine">Ranking nollautuu maanantaisin. Pisteet lasketaan selaimessasi, joten ranking on hauskaa kisailua eikä virallinen. Palkintoja ei ole.</p></section>';
    $('aloita').addEventListener('click',play);
    loadRank();
  }
  function loadRank(){
    var el=$('rank');if(!el)return;
    if(!SB){el.innerHTML='<p class="kfine">Viikon ranking aukeaa pian. Pelaa sillä välin ja kerää pisteitä tasoon.</p>';return}
    fetch(SB.url+'/rest/v1/viikon_ranking?select=nimi,pisteet&viikko=eq.'+week()+'&order=pisteet.desc,luotu.asc&limit=20',{headers:hdr()})
    .then(function(r){return r.json()}).then(function(rows){
      if(!rows.length){el.innerHTML='<p class="kfine">Tällä viikolla ei vielä tuloksia. Ole ensimmäinen.</p>';return}
      el.innerHTML='<ol class="ranklist">'+rows.map(function(r,i){return '<li><span>'+(i+1)+'.</span><b>'+esc(r.nimi)+'</b><em>'+r.pisteet+' p</em></li>'}).join('')+'</ol>';
    }).catch(function(){el.innerHTML='<p class="kfine">Rankingia ei voitu ladata juuri nyt.</p>'});
  }
  function play(){
    var qs=shuffle(Q).slice(0,10),i=0,score=0,ok=0,streak=0,wrong=[];
    function show(){
      var q=qs[i],opts=shuffle([q.o].concat(q.v));
      view.innerHTML='<div class="kcard"><div class="kmeta"><span>Kysymys '+(i+1)+'/10</span><span>'+score+' p'+(streak>=3?' · putki '+streak:'')+'</span></div>'+
        '<h2 class="kq">'+esc(q.k)+'</h2><div class="kopts">'+opts.map(function(o,n){return '<button class="kopt" type="button" data-i="'+n+'">'+esc(o)+'</button>'}).join('')+'</div><div id="palaute" aria-live="polite"></div></div>';
      [].forEach.call(view.querySelectorAll('.kopt'),function(b){b.addEventListener('click',function(){
        var good=opts[+b.dataset.i]===q.o;
        [].forEach.call(view.querySelectorAll('.kopt'),function(x){x.disabled=true;if(opts[+x.dataset.i]===q.o)x.classList.add('oikein')});
        if(good){streak++;ok++;score+=10+(streak>=3?5:0)}else{streak=0;b.classList.add('vaarin');wrong.push(q)}
        $('palaute').innerHTML='<p class="'+(good?'hyva':'huono')+'"><strong>'+(good?'Oikein.':'Ei aivan.')+'</strong> '+esc(q.e)+'</p>'+(good?'':'<p><a href="'+q.u+'" target="_blank" rel="noopener">Lue aiheesta lisää</a></p>')+'<button class="btn" id="seur" type="button">'+(i<9?'Seuraava':'Näytä tulos')+'</button>';
        $('seur').focus();
        $('seur').addEventListener('click',function(){i++;if(i<10)show();else end()});
      })});
    }
    function end(){
      var before=level(xp);xp+=score;put('tk-xp',xp);if(score>best){best=score;put('tk-best',best)}
      var up=level(xp)>before;
      view.innerHTML='<div class="kcard"><h2 class="kq">'+score+' pistettä</h2><p>'+ok+'/10 oikein'+(up?' · Nousit tasolle <strong>'+LV[level(xp)][1]+'</strong>':'')+'</p>'+lvlHtml()+
        (wrong.length?'<h3>Kertaa nämä</h3><ul class="kerta">'+wrong.map(function(q){return '<li><a href="'+q.u+'" target="_blank" rel="noopener">'+esc(q.t)+'</a></li>'}).join('')+'</ul>':'<p class="hyva">Täydellinen kierros.</p>')+
        (SB?'<form id="lah" class="lahetys"><label for="nimi">Lähetä tuloksesi viikon rankingiin</label><input id="nimi" maxlength="16" minlength="2" placeholder="Nimimerkki (älä käytä oikeaa nimeäsi)" value="'+esc(nick)+'" autocomplete="nickname" required><button class="btn small" type="submit">Lähetä</button></form><p id="lahviesti" class="kfine" aria-live="polite"></p>':'')+
        '<div class="actions"><button class="btn" id="uusi" type="button">Pelaa uudelleen</button><button class="btn line" id="jaa2" type="button">Jaa tulos</button></div></div>';
      $('uusi').addEventListener('click',play);
      $('jaa2').addEventListener('click',function(){
        var t='Sain Tiesitkö-kisassa '+score+' pistettä ('+ok+'/10 oikein). Kuinka paljon sinä osaat?',d={title:document.title,text:t,url:location.href};
        if(navigator.share)navigator.share(d).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(t+' '+location.href).then(function(){$('jaa2').textContent='Kopioitu'});
      });
      var f=$('lah');
      if(f)f.addEventListener('submit',function(e){
        e.preventDefault();var n=$('nimi').value.trim();
        if(n.length<2||/https?:|www\\.|@/i.test(n)){$('lahviesti').textContent='Valitse nimimerkki ilman linkkejä ja sähköpostiosoitetta.';return}
        put('tk-nick',n);nick=n;
        fetch(SB.url+'/rest/v1/tulokset',{method:'POST',headers:Object.assign(hdr(),{'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify({nimi:n,pisteet:score,viikko:week()})})
        .then(function(r){if(!r.ok)throw 0;f.hidden=true;$('lahviesti').innerHTML='Tulos lähetetty. <a href="'+location.pathname+'">Katso ranking</a>'}).catch(function(){$('lahviesti').textContent='Lähetys ei onnistunut. Yritä uudelleen.'});
      });
    }
    show();
  }
  start();
})();
`);
await writeFile(`${OUT}/kisa/index.html`, `${head(`Tiesitkö-kisa | ${NAME}`, "10 kysymystä viranomaisten tiedoista. Kerää pisteitä, nouse tasoissa ja kisaa viikon rankingissa.", "/kisa/")}
<div class="wrap">${topbar()}</div>
<main class="wrap page prose">
<a class="crumb" href="${url("/")}">← Kaikki aiheet</a>
<h1>Tiesitkö-kisa</h1>
<p class="lead">Kymmenen kysymystä siitä, mitä sivun aiheissa kerrotaan. Väärän vastauksen jälkeen näet heti oikean ja linkin aiheeseen.</p>
<div id="kisa"><noscript>Kisa tarvitsee JavaScriptin.</noscript></div>
<script type="application/json" id="kisadata">${kisaCfg}</script>
</main>${foot}<script src="${url("/kisa.js")}" defer></script></body></html>`);

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
<h2>Kisa ja tietosuoja</h2>
<p>Pisteesi ja tasosi tallentuvat vain omalle laitteellesi. Jos lähetät tuloksen viikon rankingiin, tallennamme vain nimimerkin, pisteet ja viikon numeron. Älä käytä oikeaa nimeäsi. Ylläpito voi poistaa sopimattomat nimimerkit. Kisassa ei ole palkintoja.</p>
<h2>Löysitkö virheen?</h2>
<p>Kerro siitä <a href="https://github.com/Miksu900/tiesitko/issues/new" rel="noopener">tästä</a>, niin korjaamme sen.</p>
</main>${foot}`;
await writeFile(`${OUT}/tietoa/index.html`, tietoa);

// 404
await writeFile(`${OUT}/404.html`, `${head(`Sivua ei löytynyt | ${NAME}`, "Sivua ei löytynyt.", "/404.html")}
<div class="wrap">${topbar()}</div><main class="wrap page"><h1>Tätä sivua ei löytynyt</h1><p class="lead">Linkki voi olla vanhentunut.</p><p><a class="btn" href="${url("/")}">Katso kaikki aiheet</a></p></main>${foot}`);

if (SITE) {
  const urls = ["/", "/kisa/", "/tietoa/", ...aiheet.map((a) => `/aihe/${a.slug}/`)];
  await writeFile(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${abs(u)}</loc><lastmod>${data.tarkistettu}</lastmod></url>`).join("")}</urlset>`);
  await writeFile(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${abs("/sitemap.xml")}\n`);
  await writeFile(`${OUT}/CNAME`, new URL(SITE).hostname + "\n");
}
console.log(`Valmis: ${aiheet.length} aihetta, ${SITE ? SITE : "ei omaa verkkotunnusta (noindex)"}`);
