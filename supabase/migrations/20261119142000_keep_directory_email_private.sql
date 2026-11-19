-- Public profiles, directory search, and legacy paths all read this projection.
create or replace view public.directory_public as
select id, (published - 'publicEmail' - 'email') || jsonb_build_object('profileSlug', profile_slug) as listing
from public.directory_entries
where published is not null and deletion_due_at is null;
