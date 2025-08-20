create table if not exists public.siswa (
  id   text primary key,
  nama text not null
);
create table if not exists public.absensi (
  id        bigserial primary key,
  siswa_id  text not null references public.siswa(id) on delete cascade,
  waktu     timestamptz not null default now(),
  tgl       date generated always as (waktu::date) stored,
  jenis     text check (jenis in ('pagi','pulang')) not null,
  scanner   text
);
create unique index if not exists uniq_absen_harian
  on public.absensi (siswa_id, tgl, jenis);

alter table public.siswa  enable row level security;
alter table public.absensi enable row level security;

create policy if not exists siswa_select_public on public.siswa
for select using (true);

create policy if not exists absensi_select_public on public.absensi
for select using (true);

create policy if not exists absensi_insert_public on public.absensi
for insert with check (jenis in ('chek in','chek out'));
