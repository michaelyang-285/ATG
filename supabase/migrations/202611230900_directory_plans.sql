alter table public.directory_entries
  add column subscription_id text unique,
  add column billing_customer text,
  add column premium_until timestamptz,
  add column submitted_at timestamptz;

create function public.guard_directory_submission() returns trigger language plpgsql set search_path='' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.owner_id::text,0));
  if exists(select 1 from public.directory_entries where owner_id=new.owner_id and submitted_at > now()-interval '24 hours' offset 2) then
    raise exception 'Daily listing limit reached' using errcode='P0429';
  end if;
  if exists(select 1 from public.directory_entries where owner_id=new.owner_id and lower(trim(draft->>'name'))=lower(trim(new.draft->>'name')) and contact->>'zip'=new.contact->>'zip') then
    raise exception 'Edit your existing listing' using errcode='P0409';
  end if;
  new.submitted_at := now();
  return new;
end $$;
create trigger guard_directory_submission before insert on public.directory_entries for each row execute function public.guard_directory_submission();
create trigger queue_new_listing after insert on public.directory_entries for each row when (new.status='review') execute function public.queue_profile_submission_alert();
create trigger queue_unpaid_listing after update of status on public.directory_entries for each row when (old.status='unpaid' and new.status='review') execute function public.queue_profile_submission_alert();

create or replace view public.directory_public as
select id, (case when premium_until > now() then published
  when paid_session is not null then published - 'deal'
  else published - array['url','booking','social','facebook','meta','instagram','tiktok','linkedin','x','threads','youtube','pinterest','gallery','deal'] end
  - 'publicEmail' - 'email') || jsonb_build_object('profileSlug',profile_slug,'premium',coalesce(premium_until > now(),false)) as listing
from public.directory_entries where published is not null and deletion_due_at is null;

create table public.directory_upload_quota (
  owner_id uuid primary key references auth.users on delete cascade,
  window_start timestamptz not null default now(), attempts integer not null
);
alter table public.directory_upload_quota enable row level security;
revoke all on public.directory_upload_quota from public, anon, authenticated;
grant all on public.directory_upload_quota to service_role;
create function public.reserve_directory_upload(uid uuid) returns boolean
language sql set search_path='' as $$
 with reserved as (
 insert into public.directory_upload_quota as q(owner_id,attempts) values(uid,1)
 on conflict(owner_id) do update set
 attempts=case when q.window_start<=now()-interval '1 hour' then 1 else q.attempts+1 end,
 window_start=case when q.window_start<=now()-interval '1 hour' then now() else q.window_start end
 where q.window_start<=now()-interval '1 hour' or q.attempts<30
 returning 1)
 select exists(select from reserved)
$$;
revoke all on function public.reserve_directory_upload(uuid) from public, anon, authenticated;
grant execute on function public.reserve_directory_upload(uuid) to service_role;
