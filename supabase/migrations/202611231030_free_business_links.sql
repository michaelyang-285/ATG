create or replace view public.directory_public as
select id, (case when premium_until > now() then published
  when paid_session is not null then published - 'deal'
  else published - array['gallery','deal'] end
  - 'publicEmail' - 'email') || jsonb_build_object('profileSlug',profile_slug,'premium',coalesce(premium_until > now(),false)) as listing
from public.directory_entries where published is not null and deletion_due_at is null;

