create extension if not exists "pgcrypto";

create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = check_user_id
  );
$$;

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'moderator')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  nearest_station text,
  lat double precision,
  lng double precision,
  area_tag text not null,
  status text not null check (status in ('approved', 'pending', 'rejected')) default 'pending',
  moderation_note text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint places_location_required check (address is not null or nearest_station is not null)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  rating integer check (rating between 1 and 5),
  status text not null check (status in ('approved', 'pending', 'rejected')) default 'pending',
  author_id text not null,
  author_ip text not null,
  author_ua text not null,
  moderation_note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('place', 'review')),
  target_id uuid not null,
  reason text not null,
  detail text,
  reporter_ip text not null,
  reporter_ua text not null,
  created_at timestamptz not null default timezone('utc', now()),
  status text not null check (status in ('received', 'investigating', 'resolved')) default 'received',
  admin_notes text
);

create table if not exists public.takedown_requests (
  id uuid primary key default gen_random_uuid(),
  target_url text not null,
  contact_name text not null,
  contact_email text not null,
  reason text not null,
  evidence_url text,
  created_at timestamptz not null default timezone('utc', now()),
  status text not null check (status in ('received', 'investigating', 'resolved')) default 'received',
  admin_notes text
);

create table if not exists public.official_responses (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  body text not null,
  status text not null check (status in ('approved', 'pending', 'rejected')) default 'pending',
  moderation_note text,
  contact_name text,
  contact_email text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rate_limits (
  id bigserial primary key,
  action text not null,
  ip text not null,
  ua text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_places_status_created_at
  on public.places (status, created_at desc);
create index if not exists idx_reviews_place_status_created_at
  on public.reviews (place_id, status, created_at desc);
create index if not exists idx_reports_status_created_at
  on public.reports (status, created_at desc);
create index if not exists idx_takedown_status_created_at
  on public.takedown_requests (status, created_at desc);
create index if not exists idx_official_responses_place_status_created_at
  on public.official_responses (place_id, status, created_at desc);
create index if not exists idx_rate_limits_action_ip_created_at
  on public.rate_limits (action, ip, created_at desc);
create index if not exists idx_audit_logs_created_at
  on public.audit_logs (created_at desc);

alter table public.admins enable row level security;
alter table public.places enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.takedown_requests enable row level security;
alter table public.official_responses enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rate_limits enable row level security;

drop policy if exists "admins can read own row" on public.admins;
create policy "admins can read own row"
  on public.admins
  for select
  using (auth.uid() = user_id);

drop policy if exists "public can read approved places" on public.places;
create policy "public can read approved places"
  on public.places
  for select
  using (status = 'approved');

drop policy if exists "admins can manage places" on public.places;
create policy "admins can manage places"
  on public.places
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "public can read approved reviews" on public.reviews;
create policy "public can read approved reviews"
  on public.reviews
  for select
  using (status = 'approved');

drop policy if exists "admins can manage reviews" on public.reviews;
create policy "admins can manage reviews"
  on public.reviews
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "public can read approved responses" on public.official_responses;
create policy "public can read approved responses"
  on public.official_responses
  for select
  using (status = 'approved');

drop policy if exists "admins can manage responses" on public.official_responses;
create policy "admins can manage responses"
  on public.official_responses
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "admins can manage reports" on public.reports;
create policy "admins can manage reports"
  on public.reports
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "admins can manage takedowns" on public.takedown_requests;
create policy "admins can manage takedowns"
  on public.takedown_requests
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "admins can manage audit logs" on public.audit_logs;
create policy "admins can manage audit logs"
  on public.audit_logs
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "admins can manage rate limits" on public.rate_limits;
create policy "admins can manage rate limits"
  on public.rate_limits
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
