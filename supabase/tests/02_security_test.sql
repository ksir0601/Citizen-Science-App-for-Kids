-- =====================================================================
-- Security rules testing. Each test pretends to be one kind of user and
-- tries something that must be allowed or must be blocked
--
-- The website and app reach the database as the
-- role "authenticated" (signed in) or "anon" (not signed in), and
-- Supabase passes the signed-in user's id in request.jwt.claim.sub
-- =====================================================================
begin;
create extension if not exists pgtap with schema extensions;

select plan(22);

-- =====================================================================
-- TEACHERS: only their own projects and questions
-- =====================================================================

-- Sign in as Teacher 1
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';

select is((select count(*)::int from public.projects), 2,
  'Teacher 1 sees only their 2 projects');

-- Sign in as Teacher 2
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select is((select count(*)::int from public.projects), 1,
  'Teacher 2 sees only their 1 project');

select is_empty(
  $$ select 1 from public.questions where project_id = '30000000-0000-0000-0000-000000000001' $$,
  'Teacher 2 cannot see Teacher 1''s questions');

-- An update or delete that the rules block changes 0 rows.
-- "returning 1" gives one row per change, so empty = nothing changed.
select is_empty(
  $$ update public.projects set name = 'Hacked' where join_code = 'BUGCNT' returning 1 $$,
  'Teacher 2 cannot rename Teacher 1''s project');

select is_empty(
  $$ delete from public.projects where join_code = 'BUGCNT' returning 1 $$,
  'Teacher 2 cannot delete Teacher 1''s project');

-- A blocked insert raises error 42501 ("row-level security").
select throws_ok(
  $$ insert into public.projects (teacher_id, name)
     values ('10000000-0000-0000-0000-000000000001', 'Sneaky') $$,
  '42501', null,
  'Teacher 2 cannot create a project in Teacher 1''s name');

select isnt_empty(
  $$ update public.projects set is_open = false where join_code = 'TREHNT' returning 1 $$,
  'Teacher 2 can close their own project');

select is((select count(*)::int from public.observations), 4,
  'Teacher 2 sees the 4 observations in their project');


-- =====================================================================
-- KIDS: only joined projects, only open ones, only their own rows
-- =====================================================================

-- Sign in as kid 2 (joined Backyard Bug Count only)
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000002';

select is((select count(*)::int from public.projects), 1,
  'Kid sees only the 1 project they joined (cannot list all projects)');

select is(
  (select count(*)::int from public.questions where project_id = '30000000-0000-0000-0000-000000000001'),
  4,
  'Kid sees the 4 questions of the project they joined');

select is_empty(
  $$ select 1 from public.questions where project_id = '30000000-0000-0000-0000-000000000002' $$,
  'Kid cannot see questions of a project they did not join');

select is((select count(*)::int from public.observations), 3,
  'Kid sees only their own 3 observations, not classmates''');

select lives_ok(
  $$ insert into public.observations (project_id, answers)
     values ('30000000-0000-0000-0000-000000000001', '{}') $$,
  'Kid can add an observation to a joined, open project');

select throws_ok(
  $$ insert into public.observations (project_id, answers)
     values ('30000000-0000-0000-0000-000000000002', '{}') $$,
  '42501', null,
  'Kid cannot add to a project they did not join');

select throws_ok(
  $$ insert into public.observations (project_id, created_by, answers)
     values ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '{}') $$,
  '42501', null,
  'Kid cannot add an observation as a different kid');

select isnt_empty(
  $$ update public.observations set nickname = 'Ava' returning 1 $$,
  'Kid can edit their own observations');

select is_empty(
  $$ update public.observations set nickname = 'Hacked'
     where created_by = '20000000-0000-0000-0000-000000000001' returning 1 $$,
  'Kid cannot edit a classmate''s observations');

select throws_ok(
  $$ insert into public.projects (teacher_id, name)
     values ('20000000-0000-0000-0000-000000000002', 'Kid project') $$,
  '42501', null,
  'Kid cannot create a project');

-- Sign in as kid 4 (joined Fall Leaf Hunt, which is closed)
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000004';

select throws_ok(
  $$ insert into public.observations (project_id, answers)
     values ('30000000-0000-0000-0000-000000000003', '{}') $$,
  '42501', null,
  'Kid cannot add to a closed project');


-- =====================================================================
-- NOT SIGNED IN: nothing
-- =====================================================================
set local role anon;
set local request.jwt.claim.sub = '';

select is_empty(
  $$ select 1 from public.projects
     union all select 1 from public.questions
     union all select 1 from public.observations $$,
  'Signed out: sees no projects, questions or observations');

select throws_ok(
  $$ insert into public.observations (project_id, answers)
     values ('30000000-0000-0000-0000-000000000001', '{}') $$,
  '42501', null,
  'Signed out: cannot add an observation');

select throws_ok(
  $$ select public.join_project('BUGCNT') $$,
  '42501', null,
  'Signed out: cannot use a join code');

select * from finish();
rollback;
