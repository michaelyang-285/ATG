-- Project only the fields needed by the owner-only People table.
create function public.admin_filtered_people_page(page_number integer, page_size integer, contact_filter text)
returns table(id text,email text,created timestamptz,info jsonb,approved boolean,newsletter boolean)
language sql stable security definer set search_path = '' as $$
  with people as (
    select u.id::text, u.email::text, u.created_at,
      jsonb_build_object('firstName',u.raw_user_meta_data->>'firstName','lastName',u.raw_user_meta_data->>'lastName',
        'name',u.raw_user_meta_data->>'name','city',u.raw_user_meta_data->>'city') as info,
      coalesce(u.raw_app_meta_data->'approved_author'='true'::jsonb,false) as approved,
      n.email is not null as newsletter
    from auth.users u left join public.newsletter_subscribers n
      on u.email_confirmed_at is not null and n.email=lower(trim(u.email))
    union all
    select 'newsletter:'||n.email,n.email,n.subscribed_at,'{}'::jsonb,false,true
    from public.newsletter_subscribers n where not exists (
      select 1 from auth.users u where u.email_confirmed_at is not null and lower(trim(u.email))=n.email
    )
  )
  select * from people where contact_filter='all' or (contact_filter='newsletter' and people.newsletter) or (contact_filter='accounts' and people.id not like 'newsletter:%') order by created_at desc,id
  limit least(greatest(page_size,1),500)+1
  offset (greatest(page_number,1)::bigint-1)*least(greatest(page_size,1),500);
$$;
revoke all on function public.admin_filtered_people_page(integer,integer,text) from public,anon,authenticated;
grant execute on function public.admin_filtered_people_page(integer,integer,text) to service_role;
