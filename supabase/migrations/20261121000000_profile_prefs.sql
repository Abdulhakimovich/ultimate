-- Migration: add sound/haptics preferences and delete_my_account RPC
-- Idempotent: safe to run multiple times

alter table public.profiles
  add column if not exists sound_enabled boolean not null default true,
  add column if not exists haptics_enabled boolean not null default true;

-- Function to delete the calling user's account (cascades all their data)
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- Lock down execution: only authenticated users may call this
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
