-- =====================================================================
-- Run all tests with:  supabase test db
-- Every test file starts with begin and ends with rollback, so the
-- test data it adds or deletes is undone when it finishes

-- Citation: This code was generated with the help of Claude.  This transcript document 'sup-pgTAP-tutorial.md'  
-- the GenAI interaction that led to my solution regarding test building and security rules."
-- File Owner: Kelcie 
-- =====================================================================
begin;
create extension if not exists pgtap with schema extensions;

select plan(12);   -- this file has 12 tests

-- ---------------------------------------------------------------------
-- The five tables exist, with security turned on
-- ---------------------------------------------------------------------
select has_table('public', 'teachers', 'teachers table exists');
select has_table('public', 'projects', 'projects table exists');
select has_table('public', 'questions', 'questions table exists');
select has_table('public', 'project_members', 'project_members table exists');
select has_table('public', 'observations', 'observations table exists');

select is(
  (select count(*)::int from pg_tables
   where schemaname = 'public'
     and tablename in ('teachers', 'projects', 'questions', 'project_members', 'observations')
     and rowsecurity),
  5,
  'Row Level Security is on for all 5 tables'
);

-- ---------------------------------------------------------------------
-- Signup trigger: email users become teachers, anonymous kids don't
-- ---------------------------------------------------------------------
insert into auth.users (id, email, is_anonymous, raw_user_meta_data)
values ('99999999-0000-0000-0000-000000000001', 'new@test.local', false, '{"display_name":"New Teacher"}');

insert into auth.users (id, is_anonymous)
values ('99999999-0000-0000-0000-000000000002', true);

select is(
  (select display_name from public.teachers where id = '99999999-0000-0000-0000-000000000001'),
  'New Teacher',
  'A teacher who signs up gets a teachers row with their name'
);

select is_empty(
  $$ select 1 from public.teachers where id = '99999999-0000-0000-0000-000000000002' $$,
  'A kid (anonymous) does NOT get a teachers row'
);

-- ---------------------------------------------------------------------
-- Join codes
-- --------------------------------------------------------------------
insert into public.projects (id, teacher_id, name)
values ('99999999-0000-0000-0000-000000000003', '99999999-0000-0000-0000-000000000001', 'Code test');

select matches(
  (select join_code from public.projects where id = '99999999-0000-0000-0000-000000000003'),
  '^[A-HJKMNP-Z]{6}$',
  'A new project gets a 6-letter code with no I, L or O'
);

select throws_ok(
  $$ insert into public.projects (teacher_id, name, join_code)
     values ('10000000-0000-0000-0000-000000000002', 'Copy', 'BUGCNT') $$,
  '23505', null,
  'Two projects cannot share a join code'
);

-- ---------------------------------------------------------------------
-- updated_at changes on edit
-- now() is the time the test started, and it stays the same for the
-- whole test
-- ---------------------------------------------------------------------
update public.observations set nickname = 'Edited'
where project_id = '30000000-0000-0000-0000-000000000003';

select ok(
  (select bool_and(updated_at > created_at) from public.observations
   where project_id = '30000000-0000-0000-0000-000000000003'),
  'Editing an observation updates updated_at'
);

-- ---------------------------------------------------------------------
-- Cascades: deleting Teacher 1 removes their projects and everything in them
-- ---------------------------------------------------------------------
delete from auth.users where id = '10000000-0000-0000-0000-000000000001';

select is_empty(
  $$ select 1 from public.projects where teacher_id = '10000000-0000-0000-0000-000000000001'
     union all
     select 1 from public.questions where project_id = '30000000-0000-0000-0000-000000000001'
     union all
     select 1 from public.observations where project_id = '30000000-0000-0000-0000-000000000001' $$,
  'Deleting a teacher deletes their projects, questions and observations'
);

select * from finish();
rollback;