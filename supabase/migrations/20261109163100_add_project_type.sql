alter table public.contact_requests
add column project_type text
check (project_type is null or char_length(project_type) <= 120);

revoke all on table public.contact_requests from anon, authenticated;
grant insert (full_name, email, organization, phone, project_type, message, source)
on table public.contact_requests to anon, authenticated;
