alter table public.directory_entries add column profile_slug text;

-- Keep previous names claimed so bookmarks still lead to the original business.
create table public.directory_slug_history (
  path text primary key,
  entry_id uuid not null references public.directory_entries(id) on delete cascade
    deferrable initially deferred
);
create index directory_slug_history_entry on public.directory_slug_history(entry_id);
alter table public.directory_slug_history enable row level security;
revoke all on public.directory_slug_history from public, anon, authenticated;
grant select, insert, update, delete on public.directory_slug_history to service_role;

create function public.assign_directory_profile_slug() returns trigger
language plpgsql set search_path = pg_catalog as $$
declare
  stem text;
  candidate text;
  suffix integer := 1;
  claimed text;
begin
  if new.published is null then return new; end if;
  if tg_op = 'UPDATE' and old.profile_slug is not null
    and old.published->>'name' is not distinct from new.published->>'name'
  then return new; end if;
  stem := normalize(lower(coalesce(new.published->>'name', '')), NFKD);
  stem := regexp_replace(stem, U&'[\0300-\036F]', '', 'g');
  stem := trim(both '-' from left(regexp_replace(stem, '[^[:alnum:]]+', '-', 'g'), 180));
  if stem = '' then stem := 'business'; end if;
  if stem in ('manage','submit','sample-coffee-profile') or
     stem ~ '^local-[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$'
  then stem := stem || '-business'; end if;
  loop
    candidate := case when suffix = 1 then stem else stem || '-' || suffix end;
    insert into public.directory_slug_history as history(path,entry_id)
      values (candidate,new.id)
      on conflict (path) do update set path = excluded.path
        where history.entry_id = excluded.entry_id
      returning path into claimed;
    if claimed is not null then
      new.profile_slug := claimed;
      return new;
    end if;
    suffix := suffix + 1;
  end loop;
end;
$$;
create trigger assign_directory_profile_slug before insert or update of published on public.directory_entries
for each row execute function public.assign_directory_profile_slug();

update public.directory_entries set published = published where published is not null and profile_slug is null;

-- Existing search clients continue to receive their previous slug until the web release.
create or replace view public.directory_public as
select id, published || jsonb_build_object('profileSlug', profile_slug) as listing
from public.directory_entries where published is not null and deletion_due_at is null;

create view public.directory_profile_paths as
select history.path, listing.id, listing.listing
from public.directory_slug_history history join public.directory_public listing on listing.id = history.entry_id;
revoke all on public.directory_profile_paths from public, anon, authenticated;
grant select on public.directory_profile_paths to anon, authenticated, service_role;
