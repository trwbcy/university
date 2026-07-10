-- =========================================================================
--  TRWBCY / SISTEM INFORMASI — skema database Supabase
--  Tempel seluruh isi file ini ke: Supabase Dashboard > SQL Editor > New query
--  lalu klik RUN. Aman dijalankan sekali di project baru.
-- =========================================================================

-- ---- TABEL ----------------------------------------------------------------

create table if not exists public.semesters (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  code        text not null,
  title       text not null,
  sks         integer default 0,
  ipk         numeric,
  active      boolean default false,
  "order"     integer default 0,
  created_at  timestamptz default now()
);

create table if not exists public.schedule (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  semester_id text not null references public.semesters(id) on delete cascade,
  day         integer not null,
  time        text,
  type        text,
  course      text,
  meta        text
);

create table if not exists public.tasks (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  semester_id text not null references public.semesters(id) on delete cascade,
  title       text not null,
  course      text,
  due         date,
  done        boolean default false,
  done_at     date
);

create table if not exists public.tx (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  semester_id text not null references public.semesters(id) on delete cascade,
  date        date,
  title       text not null,
  category    text,
  amount      numeric default 0,
  kind        text default 'out'
);

create table if not exists public.budgets (
  user_id     uuid not null references auth.users(id) on delete cascade,
  semester_id text not null references public.semesters(id) on delete cascade,
  amount      numeric default 0,
  primary key (user_id, semester_id)
);

-- Profil pengguna: satu baris per akun. Menyimpan info identitas ringan
-- seperti NIM. JANGAN simpan password/PIN/kredensial apa pun di sini —
-- autentikasi sepenuhnya ditangani Supabase Auth (auth.users).
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  nim         text,
  created_at  timestamptz default now()
);

-- ---- ROW LEVEL SECURITY ---------------------------------------------------
-- Tiap pengguna hanya bisa membaca/menulis barisnya sendiri.

alter table public.semesters enable row level security;
alter table public.schedule  enable row level security;
alter table public.tasks     enable row level security;
alter table public.tx        enable row level security;
alter table public.budgets   enable row level security;
alter table public.profiles  enable row level security;

-- pola kebijakan sama untuk tiap tabel: user_id = auth.uid()
do $$
declare t text;
begin
  foreach t in array array['semesters','schedule','tasks','tx','budgets','profiles']
  loop
    execute format('drop policy if exists "own_select" on public.%I;', t);
    execute format('drop policy if exists "own_insert" on public.%I;', t);
    execute format('drop policy if exists "own_update" on public.%I;', t);
    execute format('drop policy if exists "own_delete" on public.%I;', t);

    execute format('create policy "own_select" on public.%I for select using (user_id = auth.uid());', t);
    execute format('create policy "own_insert" on public.%I for insert with check (user_id = auth.uid());', t);
    execute format('create policy "own_update" on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid());', t);
    execute format('create policy "own_delete" on public.%I for delete using (user_id = auth.uid());', t);
  end loop;
end $$;

-- ---- INDEKS (mempercepat query per semester) ------------------------------
create index if not exists idx_schedule_sem on public.schedule(semester_id);
create index if not exists idx_tasks_sem     on public.tasks(semester_id);
create index if not exists idx_tx_sem        on public.tx(semester_id);

-- Selesai. Kembali ke aplikasi, isi js/config.js dengan Project URL + anon key.
