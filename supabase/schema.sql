begin;

create schema if not exists portal_private;
revoke all on schema portal_private from public, anon, authenticated;

create table if not exists portal_private.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table portal_private.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from portal_private.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

create table if not exists public.newsroom_staff (
  email text primary key check (length(email) between 3 and 254 and email = lower(email)),
  role text not null check (role in ('reporter','editor'))
);
create table if not exists public.newsroom_articles (
  id text primary key check (id ~ '^[a-z0-9-]{1,96}$'),
  title text not null check (length(title) between 1 and 150),
  summary text not null check (length(summary) between 1 and 300),
  body text not null check (length(body) between 1 and 16000),
  category text not null check (category in ('national','probash','world','business','sport','politics','district','entertainment','jobs','education','opinion','lifestyle','tech','faith','culture','satire','fashion','editorial','corporate','features','media','social','health','events','science')),
  author text not null check (length(author) between 1 and 100),
  editor_email text not null,
  district text check (district ~ '^([1-9]|[1-5][0-9]|6[0-4])$' and category in ('national','district')),
  country text check (country is null or (category = 'probash' and country in ('malaysia','saudi-arabia','uae','uk','oman','qatar','kuwait','bahrain','jordan','singapore','japan','south-korea','maldives','italy','usa','canada','australia'))),
  image_type text check (image_type in ('image/jpeg','image/png','image/webp')),
  breaking integer not null default 0 check (breaking in (0,1)),
  status text not null check (status in ('draft','review','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  publish_at timestamptz,
  check (status <> 'published' or publish_at is not null)
);
create index if not exists newsroom_public on public.newsroom_articles(status,publish_at desc);
create index if not exists newsroom_author on public.newsroom_articles(editor_email,updated_at desc);
create table if not exists public.live_events (
  id text primary key, title text not null check (length(title) between 1 and 150),
  summary text not null check (length(summary) between 1 and 500),
  started_at timestamptz not null default now(), ended_at timestamptz,
  check (ended_at is null or ended_at >= started_at)
);
create table if not exists public.live_updates (
  id text primary key, event_id text not null references public.live_events(id) on delete cascade,
  headline text not null check (length(headline) between 1 and 150),
  body text not null check (length(body) between 1 and 5000),
  author text not null check (length(author) between 1 and 100),
  posted_at timestamptz not null default now()
);
create index if not exists live_updates_event_time on public.live_updates(event_id,posted_at desc);
create table if not exists public.reader_submissions (
  id text primary key, kind text not null check (kind in ('tip','correction')),
  article_id text, location text, message text not null check (length(message) between 10 and 4000),
  contact text, image_type text check (image_type in ('image/jpeg','image/png','image/webp')),
  created_at timestamptz not null default now(), reviewed_at timestamptz
);
create index if not exists reader_submissions_review on public.reader_submissions(reviewed_at,created_at desc);
create table if not exists public.article_notes (
  id text primary key, article_id text not null, note text not null check (length(note) between 1 and 1500),
  source text check (source ~* '^https?://' and length(source) <= 1000),
  created_at timestamptz not null default now()
);
create index if not exists article_notes_story on public.article_notes(article_id,created_at desc);
create table if not exists public.portal_content (
  kind text not null check (kind in ('comparison','opportunity','product','delivery-zone','layout','video','gallery','edition','navigation','copy','translation','media')),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,95}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 125000),
  position integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key(kind,slug)
);
create index if not exists portal_content_order on public.portal_content(kind,active,position,slug);
create table if not exists public.shop_orders (
  id uuid primary key,
  customer_name text not null check (length(customer_name) between 2 and 100),
  phone text not null check (length(phone) between 6 and 30),
  address text not null check (length(address) between 8 and 500),
  zone text not null,
  lines jsonb not null check (jsonb_typeof(lines) = 'array'),
  subtotal_bdt integer not null check (subtotal_bdt >= 0),
  delivery_bdt integer not null check (delivery_bdt >= 0),
  total_bdt integer generated always as (subtotal_bdt + delivery_bdt) stored,
  status text not null default 'received' check (status in ('received','confirmed','dispatched','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create or replace function portal_private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists newsroom_articles_updated on public.newsroom_articles;
create trigger newsroom_articles_updated before update on public.newsroom_articles
for each row execute function portal_private.touch_updated_at();
drop trigger if exists portal_content_updated on public.portal_content;
create trigger portal_content_updated before update on public.portal_content
for each row execute function portal_private.touch_updated_at();

do $$ declare relation text;
begin
  foreach relation in array array['newsroom_staff','newsroom_articles','live_events','live_updates','reader_submissions','article_notes','portal_content','shop_orders'] loop
    execute format('alter table public.%I enable row level security',relation);
    execute format('revoke all on public.%I from anon, authenticated',relation);
    execute format('grant select, insert, update, delete on public.%I to authenticated, service_role',relation);
    execute format('drop policy if exists administrators on public.%I',relation);
    execute format('create policy administrators on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',relation);
  end loop;
end $$;
grant select on public.portal_content, public.live_events, public.live_updates, public.article_notes to anon;
drop policy if exists active_portal_content on public.portal_content;
create policy active_portal_content on public.portal_content for select to anon, authenticated
using (active and kind <> 'translation');
drop policy if exists public_live_events on public.live_events;
create policy public_live_events on public.live_events for select to anon, authenticated using (true);
drop policy if exists public_live_updates on public.live_updates;
create policy public_live_updates on public.live_updates for select to anon, authenticated using (true);
drop policy if exists public_article_notes on public.article_notes;
create policy public_article_notes on public.article_notes for select to anon, authenticated using (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values
 ('portal-public','portal-public',true,3145728,array['image/jpeg','image/png','image/webp']),
 ('portal-private','portal-private',false,3145728,array['image/jpeg','image/png','image/webp','text/plain','application/json'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists portal_public_media_admin on storage.objects;
create policy portal_public_media_admin on storage.objects for all to authenticated
using (bucket_id = 'portal-public' and (select public.is_admin()))
with check (bucket_id = 'portal-public' and (select public.is_admin()));
drop policy if exists portal_private_media_admin on storage.objects;
create policy portal_private_media_admin on storage.objects for select to authenticated
using (bucket_id = 'portal-private' and (select public.is_admin()));

commit;
