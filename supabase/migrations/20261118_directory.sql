create table public.directory_entries (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 contact jsonb not null,
 draft jsonb not null,
 published jsonb,
 revision integer not null default 1,
 status text not null default 'unpaid' check(status in ('unpaid','review','published','changes','declined')),
 paid_session text unique,
 checkout_session text unique,
 checkout_attempt integer not null default 1,
 review_note text not null default ''
);
create index directory_entries_owner on public.directory_entries(owner_id);
alter table public.directory_entries enable row level security;
revoke all on public.directory_entries from anon, authenticated;
grant all on public.directory_entries to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('directory-media','directory-media',true,2000000,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create view public.directory_public as
select id, published as listing from public.directory_entries where published is not null;
revoke all on public.directory_public from public,anon,authenticated;
grant select on public.directory_public to anon,authenticated,service_role;
