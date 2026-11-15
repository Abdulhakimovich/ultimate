-- Ultimate Habit Tracker: Initial Supabase Migration
-- Tables: profiles, habits, monthly_goals, habit_completions, tasks, daily_entries
-- Row Level Security (RLS) enabled on all tables with user_id / auth.uid() isolation.

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  theme text check (theme in ('dark', 'light')) default 'dark' not null,
  language text check (language in ('ru', 'en', 'uz')) default 'ru' not null,
  local_import_done_at timestamptz,
  created_at timestamptz default now() not null
);

-- 2. HABITS
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '🎯',
  color text not null default '#00D4FF',
  archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz default now() not null
);

-- 3. MONTHLY GOALS
create table if not exists public.monthly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  year integer not null,
  month integer not null,
  goal_text text default '',
  habit_targets jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  constraint monthly_goals_user_year_month_key unique (user_id, year, month)
);

-- 4. HABIT COMPLETIONS
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz default now() not null,
  constraint habit_completions_user_habit_date_key unique (user_id, habit_id, completed_date)
);

-- 5. TASKS
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day_date date not null,
  text text not null,
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz default now() not null
);

-- 6. DAILY ENTRIES
create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day_date date not null,
  notes text[] not null default '{}',
  improvements text[] not null default '{}',
  gratitude text[] not null default '{}',
  created_at timestamptz default now() not null,
  constraint daily_entries_user_day_date_key unique (user_id, day_date)
);

-- INDEXES
create index if not exists idx_habits_user_id on public.habits (user_id);
create index if not exists idx_habits_user_sort on public.habits (user_id, sort_order);
create index if not exists idx_habit_completions_user_date on public.habit_completions (user_id, completed_date);
create index if not exists idx_habit_completions_habit on public.habit_completions (habit_id);
create index if not exists idx_monthly_goals_user_month on public.monthly_goals (user_id, year, month);
create index if not exists idx_tasks_user_date on public.tasks (user_id, day_date);
create index if not exists idx_daily_entries_user_date on public.daily_entries (user_id, day_date);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.monthly_goals enable row level security;
alter table public.habit_completions enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_entries enable row level security;

-- PROFILES POLICIES
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- HABITS POLICIES
drop policy if exists "Users can view their own habits" on public.habits;
create policy "Users can view their own habits"
  on public.habits for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own habits" on public.habits;
create policy "Users can insert their own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own habits" on public.habits;
create policy "Users can update their own habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own habits" on public.habits;
create policy "Users can delete their own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- MONTHLY GOALS POLICIES
drop policy if exists "Users can view their own monthly goals" on public.monthly_goals;
create policy "Users can view their own monthly goals"
  on public.monthly_goals for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own monthly goals" on public.monthly_goals;
create policy "Users can insert their own monthly goals"
  on public.monthly_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own monthly goals" on public.monthly_goals;
create policy "Users can update their own monthly goals"
  on public.monthly_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own monthly goals" on public.monthly_goals;
create policy "Users can delete their own monthly goals"
  on public.monthly_goals for delete
  using (auth.uid() = user_id);

-- HABIT COMPLETIONS POLICIES (must also verify habit belongs to same user)
drop policy if exists "Users can view their own completions" on public.habit_completions;
create policy "Users can view their own completions"
  on public.habit_completions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own completions" on public.habit_completions;
create policy "Users can insert their own completions"
  on public.habit_completions for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update their own completions" on public.habit_completions;
create policy "Users can update their own completions"
  on public.habit_completions for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete their own completions" on public.habit_completions;
create policy "Users can delete their own completions"
  on public.habit_completions for delete
  using (auth.uid() = user_id);

-- TASKS POLICIES
drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- DAILY ENTRIES POLICIES
drop policy if exists "Users can view their own daily entries" on public.daily_entries;
create policy "Users can view their own daily entries"
  on public.daily_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own daily entries" on public.daily_entries;
create policy "Users can insert their own daily entries"
  on public.daily_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own daily entries" on public.daily_entries;
create policy "Users can update their own daily entries"
  on public.daily_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own daily entries" on public.daily_entries;
create policy "Users can delete their own daily entries"
  on public.daily_entries for delete
  using (auth.uid() = user_id);

-- AUTH TRIGGER FOR PROFILES
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, created_at)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
