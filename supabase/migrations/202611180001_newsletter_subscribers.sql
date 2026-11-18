create table public.newsletter_subscribers (
  email text primary key,
  subscribed_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from public, anon, authenticated;
grant select, insert on public.newsletter_subscribers to service_role;