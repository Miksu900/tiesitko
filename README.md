# Tiesitkö?

Staattinen sivusto, joka kokoaa 50 asiaa tuista, oikeuksista ja ilmaisista palveluista viranomaislähteineen.

- Sisältö: `aiheet.json` (jokaisella aiheella lähde-URL, tarkistuspäivä `tarkistettu`)
- Rakennus: `node build.mjs` -> `dist/`
- Julkaisu: GitHub Actions -> Pages
- Oma verkkotunnus: aseta repon Actions-muuttuja `SITE_URL` (esim. `https://tiesitko.fi`). Silloin sivu muuttuu indeksoitavaksi ja saa sitemapin, robots.txt:n ja CNAME:n. Ilman sitä sivu on `noindex`.

## Jakokuvat
Jakokuvat (`og/*.png`) luodaan komennolla `python3 scripts/og.py` (vaatii Pillow ja Inter-fontin). Aja se uudelleen, kun aiheita lisätään tai otsikoita muutetaan, ja lisää tiedostot committiin.

## Kisan viikkoranking (valinnainen)
Kisa toimii ilman palvelinta (pisteet ja tasot tallentuvat selaimeen). Viikkoranking tarvitsee ilmaisen Supabase-projektin:
1. Luo projekti ja aja `docs/supabase.sql` SQL Editorissa.
2. Lisää GitHub-repon Settings → Secrets and variables → Actions → Variables -kohtaan `SUPABASE_URL` ja `SUPABASE_ANON_KEY` (anon-avain on tarkoitettu julkiseksi, mutta älä koskaan lisää service role -avainta).
3. Aja "Julkaise sivu" -työnkulku uudelleen.
