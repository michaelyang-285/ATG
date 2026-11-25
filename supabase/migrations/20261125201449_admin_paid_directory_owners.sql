create function public.admin_paid_directory_owners(account_ids uuid[])
returns setof uuid
language sql stable security invoker set search_path = '' as $$
  select distinct e.owner_id
  from public.directory_entries e
  where e.owner_id = any(account_ids) and e.premium_until > now();
$$;

revoke all on function public.admin_paid_directory_owners(uuid[]) from public, anon, authenticated;
grant execute on function public.admin_paid_directory_owners(uuid[]) to service_role;
