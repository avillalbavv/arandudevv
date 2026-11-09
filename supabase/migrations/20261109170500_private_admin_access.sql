create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists private.admin_allowlist (
  email text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint admin_allowlist_email_check check (email = lower(email) and char_length(email) between 5 and 254)
);

revoke all on private.admin_allowlist from public, anon, authenticated;

insert into private.admin_allowlist (email, active)
values ('avillalbavv01@gmail.com', true)
on conflict (email) do update set active = excluded.active;

create or replace function private.is_arandu_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from private.admin_allowlist as admin
      where admin.active
        and admin.email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    );
$$;

revoke all on function private.is_arandu_admin() from public, anon, authenticated;
grant execute on function private.is_arandu_admin() to authenticated;

grant select on table public.contact_requests to authenticated;
grant update (status) on table public.contact_requests to authenticated;

drop policy if exists "Admins can read contact requests" on public.contact_requests;
create policy "Admins can read contact requests"
on public.contact_requests
for select
to authenticated
using ((select private.is_arandu_admin()));

drop policy if exists "Admins can update contact request status" on public.contact_requests;
create policy "Admins can update contact request status"
on public.contact_requests
for update
to authenticated
using ((select private.is_arandu_admin()))
with check ((select private.is_arandu_admin()));
