create table public.admin_interviews (
 id uuid primary key,
 owner_id uuid not null references auth.users(id),
 revision integer not null default 0,
 document jsonb not null,
 updated_at timestamptz not null default now()
);
alter table public.admin_interviews enable row level security;
revoke all on public.admin_interviews from public, anon, authenticated;
grant select,insert,update on public.admin_interviews to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('admin-interview-media','admin-interview-media',false,24000000,
 array['audio/mp4','audio/webm','audio/ogg','image/jpeg','image/png','image/webp']);
