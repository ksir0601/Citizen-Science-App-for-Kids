-- =====================================================================
-- Citation: This code was generated with the help of Claude.  This transcript document 'sup-pgTAP-tutorial.md'  
-- the GenAI interaction that led to my solution regarding test building and security rules."
-- File Owner: Kelcie
-- =====================================================================

-- =====================================================================
-- joining a project with its code, through join_project()
-- Citation: This code was generated with the help of Claude.  This transcript document 'sup-pgTAP-tutorial.md'  
-- the GenAI interaction that led to my solution regarding test building and security rules."
-- File Owner: Kelcie 
-- =====================================================================
begin;
create extension if not exists pgtap with schema extensions;

select plan(5);

-- Sign in as kid 2 (joined Backyard Bug Count only)
set local role authenticated;
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000002';

select is(
  (select id from public.join_project(' weathr ')),   -- spaces and lowercase on purpose
  '30000000-0000-0000-0000-000000000002'::uuid,
  'join_project(''WEATHR'') returns the Weather Watchers project');

select is((select count(*)::int from public.projects), 2,
  'After joining, the kid sees 2 projects');

select lives_ok(
  $$ select public.join_project('WEATHR') $$,
  'Joining the same project twice is harmless');

select throws_ok(
  $$ select public.join_project('ZZZZZZ') $$,
  'That code did not match an open project',
  'A wrong code gives a clear error');

select throws_ok(
  $$ select public.join_project('TREHNT') $$,
  'That code did not match an open project',
  'A closed project''s code gives a clear error');

select * from finish();
rollback;