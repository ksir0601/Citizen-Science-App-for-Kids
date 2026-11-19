-- =====================================================================
-- Citizen Science App for Kids: classes
-- A teacher groups their projects into classes (e.g. "Room 12 - 3rd Grade").
-- Adds the classes table, a class_id column on projects, and security rules.
-- See docs/database-design.md for the design.
-- File Owner: Kelcie
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. CLASSES
-- One row per class. Only the teacher who made it can see or change it.
-- student_count is optional; the website asks for it, the app never sees it.
-- ---------------------------------------------------------------------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid()
    references public.teachers (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  student_count int check (student_count between 1 and 500),
  created_at timestamptz not null default now()
);

create index classes_teacher_id_idx on public.classes (teacher_id);


-- ---------------------------------------------------------------------
-- 2. PROJECTS BELONG TO A CLASS
-- Optional, so projects made before this migration still work.
-- Deleting a class keeps its projects and their observations; they just
-- become "no class" (class_id = null) instead of being deleted.
-- ---------------------------------------------------------------------
alter table public.projects
  add column class_id uuid references public.classes (id) on delete set null;

create index projects_class_id_idx on public.projects (class_id);


-- ---------------------------------------------------------------------
-- 3. SECURITY HELPER
-- True when the signed-in teacher owns this class.
-- ---------------------------------------------------------------------
create function public.is_class_teacher(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.classes c
    where c.id = p_class_id
      and c.teacher_id = (select auth.uid())
  );
$$;


-- ---------------------------------------------------------------------
-- 4. SECURITY RULES FOR CLASSES
-- Teachers see and change only their own classes. Kids see none.
-- ---------------------------------------------------------------------
alter table public.classes enable row level security;

create policy "Teachers can view their classes"
  on public.classes for select to authenticated
  using (teacher_id = (select auth.uid()));

create policy "Teachers can create classes"
  on public.classes for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and exists (select 1 from public.teachers t where t.id = (select auth.uid()))
  );

create policy "Teachers can update their classes"
  on public.classes for update to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()));

create policy "Teachers can delete their classes"
  on public.classes for delete to authenticated
  using (teacher_id = (select auth.uid()));


-- ---------------------------------------------------------------------
-- 5. A PROJECT CAN ONLY GO IN ONE OF THE TEACHER'S OWN CLASSES
-- Replaces the project insert and update rules from the first migration,
-- adding the class check. Everything else in them is unchanged.
-- ---------------------------------------------------------------------
drop policy "Teachers can create projects" on public.projects;
create policy "Teachers can create projects"
  on public.projects for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and exists (select 1 from public.teachers t where t.id = (select auth.uid()))
    and (class_id is null or public.is_class_teacher(class_id))
  );

drop policy "Teachers can update their projects" on public.projects;
create policy "Teachers can update their projects"
  on public.projects for update to authenticated
  using (teacher_id = (select auth.uid()))
  with check (
    teacher_id = (select auth.uid())
    and (class_id is null or public.is_class_teacher(class_id))
  );


-- ---------------------------------------------------------------------
-- 6. TABLE ACCESS
-- Signed-in users can use the table, always limited by the rules above.
-- ---------------------------------------------------------------------
revoke all on public.classes from anon;
grant select, insert, update, delete on public.classes to authenticated;