-- Run after 202611250001_member_filter_access.sql.
-- The welcome gift is granted by a trusted database trigger, never by the browser.
create or replace function public.grant_smara_welcome_filter()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null then
    insert into public.filter_access (user_id, filter_slug, source)
      values (new.id, 'moonlit-mandala', 'welcome-gift')
      on conflict (user_id, filter_slug) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.grant_smara_welcome_filter() from public, anon, authenticated;

drop trigger if exists smara_welcome_filter on auth.users;
create trigger smara_welcome_filter
after insert or update of email_confirmed_at on auth.users
for each row execute function public.grant_smara_welcome_filter();

-- Include confirmed members present when this offer is activated. Existing grants,
-- purchase references, expiry dates and revocations must never be overwritten.
insert into public.filter_access (user_id, filter_slug, source)
  select id, 'moonlit-mandala', 'welcome-gift'
  from auth.users
  where email_confirmed_at is not null
  on conflict (user_id, filter_slug) do nothing;
