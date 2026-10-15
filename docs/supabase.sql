-- Tiesitkö?-kisan viikkoranking. Aja Supabasen SQL Editorissa.
create table if not exists tulokset (
  id bigint generated always as identity primary key,
  nimi text not null check (char_length(nimi) between 2 and 16),
  pisteet int not null check (pisteet between 0 and 150),
  viikko text not null check (viikko ~ '^\d{4}-W\d{2}$'),
  luotu timestamptz not null default now()
);
alter table tulokset enable row level security;
drop policy if exists "lue" on tulokset;
drop policy if exists "lisaa" on tulokset;
create policy "lue" on tulokset for select using (true);
create policy "lisaa" on tulokset for insert with check (true);
-- Paras tulos per nimimerkki ja viikko
create or replace view viikon_ranking as
  select distinct on (viikko, lower(nimi)) nimi, pisteet, viikko, luotu
  from tulokset
  order by viikko, lower(nimi), pisteet desc, luotu;
grant select on viikon_ranking to anon;
grant insert on tulokset to anon;
-- Törkeän nimimerkin voi poistaa: delete from tulokset where lower(nimi) = 'nimi';
