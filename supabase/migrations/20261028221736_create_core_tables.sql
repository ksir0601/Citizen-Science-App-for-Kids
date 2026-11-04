-- =====================================================================
-- Citizen Science App for Kids: core tables and security rules
-- Tables: teachers, projects, questions, project_members, observations
-- See docs/database-design.md for the design.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TEACHERS
-- One row per teacher. The id is the same as their Supabase Auth user id.
-- Rows are created automatically by a trigger when a teacher signs up.
-- ---------------------------------------------------------------------
create table public.teachers (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 2. JOIN CODE GENERATOR
-- Makes a unique 6-letter code. Skips look-alike letters I, L and O.
-- ---------------------------------------------------------------------
create function public.generate_join_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.projects p where p.join_code = code);
  end loop;
  return code;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. PROJECTS
-- ---------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid()
    references public.teachers (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text,
  join_code text not null unique default public.generate_join_code(),
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create index projects_teacher_id_idx on public.projects (teacher_id);


-- ---------------------------------------------------------------------
-- 4. QUESTIONS
-- The questions students answer for each project, in order.
-- ---------------------------------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  position int not null,
  type text not null check (type in ('checkbox', 'dropdown', 'number', 'text')),
  label text not null check (char_length(label) between 1 and 200),
  options text[],
  required boolean not null default false,
  created_at timestamptz not null default now()
);

create index questions_project_id_idx on public.questions (project_id);


-- ---------------------------------------------------------------------
-- 5. PROJECT MEMBERS
-- Which (anonymous) devices joined which project with its code.
-- Rows are added only through the join_project() function below.
-- ---------------------------------------------------------------------
create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index project_members_user_id_idx on public.project_members (user_id);


-- ---------------------------------------------------------------------
-- 6. OBSERVATIONS
-- ---------------------------------------------------------------------
create table public.observations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  created_by uuid default auth.uid()
    references auth.users (id) on delete set null,
  nickname text check (char_length(nickname) <= 30),
  answers jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index observations_project_id_idx on public.observations (project_id);
create index observations_created_by_idx on public.observations (created_by);


-- ---------------------------------------------------------------------
-- 7. AUTOMATIC HELPERS (triggers)
-- ---------------------------------------------------------------------

-- 7a. Create a teachers row when a teacher (not an anonymous kid) signs up.
create function public.handle_new_teacher()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_anonymous then
    return new;
  end if;

  insert into public.teachers (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_teacher();

-- 7b. Keep observations.updated_at current on every edit.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger observations_set_updated_at
  before update on public.observations
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 8. SECURITY HELPER FUNCTIONS
-- Used by the rules below. Running them as "security definer" avoids
-- rules on one table endlessly checking rules on another.
-- ---------------------------------------------------------------------
create function public.is_project_teacher(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and p.teacher_id = (select auth.uid())
  );
$$;

create function public.is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.project_members m
    where m.project_id = p_project_id
      and m.user_id = (select auth.uid())
  );
$$;


-- ---------------------------------------------------------------------
-- 9. JOIN A PROJECT WITH A CODE (called from the students' app)
-- supabase.rpc('join_project', { p_code: 'KTRWBP' })
-- ---------------------------------------------------------------------
create function public.join_project(p_code text)
returns public.projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.projects;
begin
  if (select auth.uid()) is null then
    raise exception 'You must be signed in to join a project';
  end if;

  select * into v_project
  from public.projects p
  where p.join_code = upper(trim(p_code))
    and p.is_open;

  if not found then
    raise exception 'That code did not match an open project';
  end if;

  insert into public.project_members (project_id, user_id)
  values (v_project.id, (select auth.uid()))
  on conflict do nothing;

  return v_project;
end;
$$;

revoke execute on function public.join_project(text) from public, anon;
grant execute on function public.join_project(text) to authenticated;

revoke execute on function public.generate_join_code() from public, anon;
grant execute on function public.generate_join_code() to authenticated;


-- ---------------------------------------------------------------------
-- 10. TURN ON ROW LEVEL SECURITY (locks every table)
-- ---------------------------------------------------------------------
alter table public.teachers        enable row level security;
alter table public.projects        enable row level security;
alter table public.questions       enable row level security;
alter table public.project_members enable row level security;
alter table public.observations    enable row level security;


-- ---------------------------------------------------------------------
-- 11. SECURITY RULES (policies)
-- "authenticated" includes both teachers and anonymous kids.
-- ---------------------------------------------------------------------

-- TEACHERS: each teacher sees and edits only their own row.
create policy "Teachers can view their own profile"
  on public.teachers for select to authenticated
  using ((select auth.uid()) = id);

create policy "Teachers can update their own profile"
  on public.teachers for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- PROJECTS
create policy "Teachers and members can view projects"
  on public.projects for select to authenticated
  using (
    teacher_id = (select auth.uid())
    or public.is_project_member(id)
  );

create policy "Teachers can create projects"
  on public.projects for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and exists (select 1 from public.teachers t where t.id = (select auth.uid()))
  );

create policy "Teachers can update their projects"
  on public.projects for update to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()));

create policy "Teachers can delete their projects"
  on public.projects for delete to authenticated
  using (teacher_id = (select auth.uid()));

-- QUESTIONS
create policy "Teachers and members can view questions"
  on public.questions for select to authenticated
  using (
    public.is_project_teacher(project_id)
    or public.is_project_member(project_id)
  );

create policy "Teachers can add questions"
  on public.questions for insert to authenticated
  with check (public.is_project_teacher(project_id));

create policy "Teachers can update questions"
  on public.questions for update to authenticated
  using (public.is_project_teacher(project_id))
  with check (public.is_project_teacher(project_id));

create policy "Teachers can delete questions"
  on public.questions for delete to authenticated
  using (public.is_project_teacher(project_id));

-- PROJECT MEMBERS: kids see their own memberships; teachers see who joined.
-- (No insert policy: joining only happens through join_project().)
create policy "Members and teachers can view memberships"
  on public.project_members for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_project_teacher(project_id)
  );

-- OBSERVATIONS
create policy "Kids see their own, teachers see their projects'"
  on public.observations for select to authenticated
  using (
    created_by = (select auth.uid())
    or public.is_project_teacher(project_id)
  );

create policy "Members can add observations to open projects"
  on public.observations for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and public.is_project_member(project_id)
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_open
    )
  );

create policy "Kids can edit their own observations"
  on public.observations for update to authenticated
  using (created_by = (select auth.uid()))
  with check (
    created_by = (select auth.uid())
    and public.is_project_member(project_id)
  );

create policy "Teachers can delete observations in their projects"
  on public.observations for delete to authenticated
  using (public.is_project_teacher(project_id));


-- ---------------------------------------------------------------------
-- 12. TABLE ACCESS FOR THE APPS
-- Signed-in users (teachers and anonymous kids) can use these tables,
-- always limited by the rules above. Signed-out visitors get nothing.
-- ---------------------------------------------------------------------
grant select, update on public.teachers to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.questions to authenticated;
grant select on public.project_members to authenticated;
grant select, insert, update, delete on public.observations to authenticated;


-- ---------------------------------------------------------------------
-- 13. EXISTING ACCOUNTS
-- Give teacher accounts created before this migration a teachers row.
-- ---------------------------------------------------------------------
insert into public.teachers (id, display_name)
select u.id, u.raw_user_meta_data ->> 'display_name'
from auth.users u
where not u.is_anonymous
on conflict (id) do nothing;