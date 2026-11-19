-- Capture a new profile exactly once when its first checkout clears.
create table public.profile_submission_alerts (
  listing_id uuid primary key,
  title text not null,
  created_at timestamptz not null default now()
);
alter table public.profile_submission_alerts enable row level security;
revoke all on public.profile_submission_alerts from public, anon, authenticated;
grant select, insert, delete on public.profile_submission_alerts to service_role;

create function public.queue_profile_submission_alert() returns trigger
language plpgsql set search_path = '' as $$
begin
  insert into public.profile_submission_alerts (listing_id, title)
  values (new.id, coalesce(nullif(new.draft->>'name', ''), 'Directory profile'))
  on conflict (listing_id) do nothing;
  return new;
end;
$$;
revoke all on function public.queue_profile_submission_alert() from public, anon, authenticated;
create trigger queue_profile_submission_alert after update of paid_session on public.directory_entries
for each row when (old.paid_session is null and new.paid_session is not null and new.status = 'review')
execute function public.queue_profile_submission_alert();
