create function public.directory_search_vector(doc jsonb) returns tsvector
language sql immutable parallel safe set search_path = pg_catalog as $$
  select setweight(to_tsvector('english', coalesce(doc->>'name','')), 'A')
    || setweight(to_tsvector('english', concat_ws(' ', doc->>'category', doc->>'categories', doc->>'services')), 'B')
    || setweight(to_tsvector('english', concat_ws(' ', doc->>'summary', doc->>'neighborhood')), 'C')
$$;

create index directory_published_search_idx on public.directory_entries using gin
  (public.directory_search_vector(published)) where published is not null;

create function public.search_atg_directory(terms text, cities text[], category_filter text, service_filter text, editorial jsonb)
returns table(business jsonb, relevance real) language sql stable security invoker set search_path = pg_catalog as $$
  with query as (select plainto_tsquery('english', left(terms,100)) as q),
  candidates as (
    select d.listing as doc, jsonb_build_object('_id',d.id,'slug','local-' || d.id::text) as identity,
      public.directory_search_vector(d.listing) as vec
    from public.directory_public d, query
    where numnode(q)=0 or public.directory_search_vector(d.listing) @@ q
    union all
    select item, '{}'::jsonb, public.directory_search_vector(item)
    from jsonb_array_elements(editorial) item, query
    where numnode(q)=0 or public.directory_search_vector(item) @@ q
  )
  select doc || identity, ts_rank_cd(vec,q)
  from candidates, query
  where (category_filter='' or doc->>'category'=category_filter or (doc->'categories') ? category_filter)
    and (service_filter='' or (doc->'services') ? service_filter)
    and (cities is null or (cardinality(cities)>0 and exists (
      select 1 from regexp_split_to_table(coalesce(doc->>'neighborhood',''), ',') area
      where lower(trim(area)) in ('gwinnett','gwinnett county','all of gwinnett')
        or lower(trim(area)) in (select lower(city) from unnest(cities) city)
    )))
  order by 2 desc, lower(doc->>'name'), (doc || identity)->>'_id'
$$;
grant execute on function public.search_atg_directory(text,text[],text,text,jsonb) to anon, authenticated;