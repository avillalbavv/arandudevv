alter table private.admin_allowlist
add column if not exists role text not null default 'admin';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_allowlist_role_check'
      and conrelid = 'private.admin_allowlist'::regclass
  ) then
    alter table private.admin_allowlist
      add constraint admin_allowlist_role_check
      check (role in ('admin', 'super_admin'));
  end if;
end
$$;

update private.admin_allowlist
set role = 'admin'
where email = 'avillalbavv01@gmail.com';

insert into private.admin_allowlist (email, active, role)
values ('administracion@arandudev.com', true, 'super_admin')
on conflict (email) do update
set active = excluded.active,
    role = excluded.role;

create or replace function private.is_arandu_super_admin()
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
        and admin.role = 'super_admin'
        and admin.email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    );
$$;

revoke all on function private.is_arandu_super_admin() from public, anon, authenticated;
grant execute on function private.is_arandu_super_admin() to authenticated;
