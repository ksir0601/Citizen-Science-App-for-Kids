-- =====================================================================
-- Classes: the table, its security rules, and how projects use it.
-- Seed data used here:
--   Teacher 1: "Room 12 - 3rd Grade" (5000...01, has Bug Count + Weather)
--              "Garden Club"         (5000...02, no projects)
--   Teacher 2: "Room 7 - 5th Grade"  (5000...03, has Fall Leaf Hunt)
--
-- Citation: This code was generated with the help of Claude.  This transcript document 'sup-pgTAP-tutorial.md'  
-- the GenAI interaction that led to my solution regarding test building and security rules."
-- File Owner: Kelcie
-- =====================================================================
begin;
create extension if not exists pgtap with schema extensions;

select plan(22);

-- =====================================================================
-- STRUCTURE
-- =====================================================================
select has_table('public', 'classes', 'classes table exists');

select has_column('public', 'projects', 'class_id', 'projects has a class_id column');

select fk_ok('public', 'projects', 'class_id', 'public', 'classes', 'id',
  'projects.class_id points to classes.id');

select ok(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'classes'),
  'Row Level Security is on for classes');

select throws_ok(
  $$ insert into public.classes (teacher_id, name, student_count)
     values ('10000000-0000-0000-0000-000000000001', 'Bad count', 0) $$,
  '23514', null,
  'student_count must be at least 1');

select throws_ok(
  $$ insert into public.classes (teacher_id, name)
     values ('10000000-0000-0000-0000-000000000001', '   ') $$,
  '23514', null,
  'A class name cannot be blank');


-- =====================================================================
-- TEACHER 2 cannot see or change Teacher 1's classes
-- =====================================================================
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select is((select count(*)::int from public.classes), 1,
  'Teacher 2 sees only their 1 class');

select is_empty(
  $$ update public.classes set name = 'Hacked'
     where id = '50000000-0000-0000-0000-000000000001' returning 1 $$,
  'Teacher 2 cannot rename Teacher 1''s class');

select is_empty(
  $$ delete from public.classes
     where id = '50000000-0000-0000-0000-000000000001' returning 1 $$,
  'Teacher 2 cannot delete Teacher 1''s class');

select throws_ok(
  $$ insert into public.classes (teacher_id, name)
     values ('10000000-0000-0000-0000-000000000001', 'Sneaky class') $$,
  '42501', null,
  'Teacher 2 cannot create a class in Teacher 1''s name');

select throws_ok(
  $$ insert into public.projects (name, class_id)
     values ('Sneaky project', '50000000-0000-0000-0000-000000000001') $$,
  '42501', null,
  'Teacher 2 cannot put a project in Teacher 1''s class');

select throws_ok(
  $$ update public.projects set class_id = '50000000-0000-0000-0000-000000000001'
     where join_code = 'TREHNT' $$,
  '42501', null,
  'Teacher 2 cannot move their project into Teacher 1''s class');


-- =====================================================================
-- KIDS see no classes and cannot make them
-- =====================================================================
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000001';

select is_empty($$ select 1 from public.classes $$,
  'A kid cannot see any classes');

select throws_ok(
  $$ insert into public.classes (name) values ('Kid class') $$,
  '42501', null,
  'A kid cannot create a class');


-- =====================================================================
-- NOT SIGNED IN: nothing
-- =====================================================================
set local role anon;
set local request.jwt.claim.sub = '';

select throws_ok(
  $$ select 1 from public.classes $$,
  '42501', null,
  'Signed out: no access to classes');


-- =====================================================================
-- TEACHER 1 manages their own classes
-- =====================================================================
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';

select is((select count(*)::int from public.classes), 2,
  'Teacher 1 sees their 2 classes');

-- The same query the website's sidebar uses
select is(
  (select jsonb_array_length(to_jsonb(array_agg(p.id)))
   from public.classes c join public.projects p on p.class_id = c.id
   where c.id = '50000000-0000-0000-0000-000000000001'),
  2,
  'Teacher 1''s Room 12 class has its 2 projects');

select lives_ok(
  $$ insert into public.classes (id, name, student_count)
     values ('50000000-0000-0000-0000-000000000099', 'New class', 20) $$,
  'Teacher 1 can create a class');

select is(
  (select teacher_id from public.classes where id = '50000000-0000-0000-0000-000000000099'),
  '10000000-0000-0000-0000-000000000001'::uuid,
  'A new class belongs to the signed-in teacher automatically');

select lives_ok(
  $$ insert into public.projects (name, class_id)
     values ('Bird Watch', '50000000-0000-0000-0000-000000000002') $$,
  'Teacher 1 can create a project in their own class');

select isnt_empty(
  $$ update public.projects set class_id = '50000000-0000-0000-0000-000000000002'
     where join_code = 'WEATHR' returning 1 $$,
  'Teacher 1 can move a project between their own classes');

-- Deleting a class keeps its projects (class_id becomes null)
delete from public.classes where id = '50000000-0000-0000-0000-000000000001';

select is(
  (select class_id from public.projects where join_code = 'BUGCNT'),
  null::uuid,
  'Deleting a class keeps its projects (they become "no class")');

select * from finish();
rollback;
