alter table public.directory_entries add column deletion_due_at timestamptz;
create index directory_deletions_due on public.directory_entries(deletion_due_at)
  where deletion_due_at is not null;

-- Hiding a contact detail also redacts any previously approved public snapshot.
create function public.redact_directory_contact() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.contact->>'hideAddress' = 'true' then
    new.draft := new.draft - 'address';
    new.published := new.published - 'address';
  end if;
  if new.contact->>'hidePhone' = 'true' then
    new.draft := new.draft - 'publicPhone';
    new.published := new.published - 'publicPhone';
  end if;
  return new;
end;
$$;
create trigger redact_directory_contact before insert or update on public.directory_entries
for each row execute function public.redact_directory_contact();

create or replace view public.directory_public as
select id, published as listing from public.directory_entries
where published is not null and deletion_due_at is null;

create function public.clear_deleted_directory_progress() returns trigger
language plpgsql set search_path = '' as $$
begin
  delete from public.directory_progress where owner_id = old.owner_id and listing_id = old.id;
  return old;
end;
$$;
create trigger clear_deleted_directory_progress after delete on public.directory_entries
for each row execute function public.clear_deleted_directory_progress();

create extension if not exists pg_cron;
select cron.schedule('atg-delete-due-directory-profiles', '* * * * *',
  'delete from public.directory_entries where deletion_due_at <= now()');
