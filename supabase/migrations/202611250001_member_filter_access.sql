-- Apply once in the project's SQL editor. No browser role may grant purchases.
create table if not exists public.filter_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  filter_slug text not null check (filter_slug in ('moonlit-mandala','mountain-mandala','waterfall-kingfisher')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  source text not null default 'manual',
  purchase_reference text,
  primary key (user_id, filter_slug)
);
alter table public.filter_access enable row level security;
revoke all on public.filter_access from anon, authenticated;
grant select on public.filter_access to authenticated;
drop policy if exists "Read own active filters" on public.filter_access;
create policy "Read own active filters" on public.filter_access
  for select to authenticated using (
    auth.uid() = user_id and revoked_at is null
    and (expires_at is null or expires_at > now())
  );
-- Grant/revoke access only from a trusted server or the owner SQL dashboard.
-- Future payment webhooks must verify the payment provider signature, map the
-- authenticated purchase to a user_id, and perform idempotent grants/refunds.
