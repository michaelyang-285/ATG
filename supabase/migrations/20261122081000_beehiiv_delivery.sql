alter table public.newsletter_subscribers
  add column if not exists beehiiv_synced_at timestamptz,
  add column if not exists signup_source text not null default 'newsletter';