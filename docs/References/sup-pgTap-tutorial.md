# Supabase Row Level Security & pgTAP Testing — Tutorial Notes

Citizen Science App for Kids · Kelcie · Nov 1, 2026

Reference File uploaded: `database-design.md` 

---

## Part 1 — How RLS works and how to test it

> **Question:** I need to understand how row level security works for my database tables, and how to test it with pgTAP.

### 1. What RLS actually does

Your app and website both use the public anon key, so anyone can send queries to your database. RLS adds a hidden `WHERE` clause that Postgres applies to every query on a table.

- **`alter table ... enable row level security`** blocks every row by default. Nothing gets through until you write a policy that allows it.
- **A policy** applies to one command (`select`, `insert`, `update` or `delete`) and one role. It has a condition:
  - **`using (...)`** decides which existing rows a user can see or touch. Used by select, update and delete.
  - **`with check (...)`** decides which new or changed rows are allowed. Used by insert and update.
- **`auth.uid()`** returns the id of the user who sent the request. Supabase reads it from the login token (the JWT). Most of your policies will compare a column to it.

Example of the shape of one rule (not the finished policy):

```sql
create policy "teachers read own projects"
on projects for select
to authenticated
using ( teacher_id = auth.uid() );
```

**Gotcha for this design:** students who sign in anonymously also get the `authenticated` role. So `to authenticated` alone lets students through. To tell them apart, use something like `(auth.jwt() ->> 'is_anonymous')::boolean`, or a check that the user has a row in `teachers`.

**Question to think about:** a student should only see a project they've joined. What table would that policy's `using` clause need to check?

### 2. How RLS failures look

| Action | What happens when RLS blocks it |
|---|---|
| select | **No error.** The rows are just missing. |
| update / delete | **No error.** It reports 0 rows changed. |
| insert, or update failing `with check` | **Error** `42501` |

So most tests check that a query returned nothing. Only a few check for an error.

### 3. How pgTAP tests RLS

- **Tests live in `supabase/tests/*.sql`** and run with `supabase test db` against the local Docker database.
- **Wrap each file in `begin;` … `rollback;`** so test data disappears afterward.
- **Start with `select plan(n);`** and **end with `select * from finish();`**.
- **Pretend to be a user.** Tests run as `postgres`, which skips RLS entirely. A test that never switches role will pass even if the policies are broken. To act as someone else:

```sql
set local role authenticated;
set local request.jwt.claims to '{"sub":"<teacher-uuid>"}';
```

Switch back with `reset role;` to create more test data. The `supabase_test_helpers` package has shortcuts like `tests.authenticate_as('teacher_a')`, but do it by hand once first so you understand what they do.

pgTAP checks used most:
- **`is_empty(query, msg)`**: the query returned nothing, meaning RLS hid the rows
- **`results_eq(query, expected, msg)`**: the query returned exactly the expected rows
- **`throws_ok(query, '42501', ...)`**: the insert was blocked
- **`lives_ok(query, msg)`**: the insert was allowed

### 4. Building the tests step by step

1. **Write test data:** two teachers (A and B), one project each, and two anonymous students. Student 1 has joined A's project; student 2 hasn't joined anything.
2. **Turn every row of the security rules table into tests.** Each rule gets one test that it allows the right person and one that it blocks the wrong person. For example:
   - Teacher B can't see teacher A's project (`is_empty`)
   - Student 2 can't insert into A's project (`throws_ok`)
   - Student 1 can't edit student 2's observation (update changes 0 rows)
3. **Make a test fail on purpose.** Comment out a policy and check that the test turns red. A test that has never failed hasn't shown it can catch a bug.
4. **Test the join-code function separately.** It's probably `security definer`, so it runs with full access and skips RLS. Test that a wrong code joins nothing and that students still can't list all projects.

**Exercise:** write the setup from step 1 and one test, "Teacher B cannot see Teacher A's project".

---

## Part 2 — More about pgTAP

> **Question:** Can you explain more about pgTAP?

pgTAP is a testing library that runs inside Postgres itself. Tests are ordinary SQL, and each test is a function call that returns a pass or fail line — the database version of Jest or pytest.

### Where the name comes from

**TAP** = Test Anything Protocol, a simple text format for results:

```
1..3
ok 1 - teacher A sees own project
not ok 2 - teacher B cannot see A's project
ok 3 - student insert blocked
```

`1..3` means "3 tests planned." Each line is `ok` or `not ok`, a number and your message. `supabase test db` (using a runner called `pg_prove`) reads these and prints a summary.

### The pieces of a test file

1. **`begin;`** starts a transaction, so everything the test changes is undone at the end.
2. **`create extension if not exists pgtap with schema extensions;`** turns pgTAP on.
3. **`select plan(5);`** says how many tests should run. If fewer run (e.g. a line crashed), the run fails — this catches tests that silently never ran.
4. **Setup and test calls.**
5. **`select * from finish();`** checks the count and reports results.
6. **`rollback;`** throws away all test data.

### The kinds of checks

**Structure checks:**
- `has_table('projects')`
- `has_column('projects', 'join_code')`
- `col_is_unique('projects', 'join_code')`
- `policies_are('public', 'projects', array[...])` — confirms exactly which policies exist

**Value checks:**
- `ok(condition, msg)`: is it true?
- `is(have, want, msg)`: are two values equal? e.g. `is((select count(*) from projects), 1::bigint, '...')`
- `results_eq(query, expected, msg)`: does the query return exactly these rows?
- `is_empty(query, msg)`: does it return no rows?

**Error checks:**
- `throws_ok(sql, '42501', msg)`: must fail with that error code
- `lives_ok(sql, msg)`: must succeed

Queries passed to `results_eq`, `is_empty`, `throws_ok` and `lives_ok` are **text strings**, like `$$ select * from projects $$`. The `$$ ... $$` quotes avoid escaping every `'`.

### Typical mistakes

- **Type mismatches.** `count(*)` returns `bigint`, so compare to `1::bigint`, not `1`.
- **Wrong plan count** after adding or removing tests. Update `plan(n)` every time.
- **One crash stops the rest.** A setup line that errors outside a pgTAP function stops the file. Put risky statements inside `throws_ok` or `lives_ok`.
- **Testing as `postgres`.** It skips RLS, so switch roles before testing policies.

### First exercise

Write a structure-only file: `plan(4)`, then `has_table` for `projects`, `questions` and `observations`, plus `col_is_unique` on `join_code`. Run `supabase test db` and read the output. Then rename a table in the test to make one fail on purpose.

**Question to think about:** what does pgTAP print if `plan(4)` but only 3 tests are written?

---

## Part 3 — Reference test script

> **Question:** Can you show me an example of one complete test script that I can reference in my test design?

One complete example for the `projects` table: teachers can only reach their own projects. Use it as the pattern for the other tables.

**`supabase/tests/projects_rls.test.sql`**

```sql
begin;
create extension if not exists pgtap with schema extensions;

select plan(7);

-- =========================================================
-- SETUP (runs as postgres, so RLS is skipped)
-- Fixed ids make the tests easy to read.
-- =========================================================

-- Two fake teacher logins
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'teacher_a@test.com'),
  ('22222222-2222-2222-2222-222222222222', 'teacher_b@test.com');

-- Their teacher rows (skip this if a trigger creates them for you)
insert into teachers (id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'Ms. A'),
  ('22222222-2222-2222-2222-222222222222', 'Mr. B');

-- One project each
insert into projects (id, teacher_id, name, join_code) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '11111111-1111-1111-1111-111111111111', 'Bird Count A', 'KTRWBP'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '22222222-2222-2222-2222-222222222222', 'Bug Hunt B',   'MNPQRS');

-- =========================================================
-- ACT AS TEACHER A
-- =========================================================
set local role authenticated;
set local request.jwt.claims to
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":false}';

-- 1. Sees only her own project
select results_eq(
  $$ select name from projects $$,
  $$ values ('Bird Count A') $$,
  'Teacher A sees only her own project'
);

-- 2. Cannot see B's project, even when asking for it by id
select is_empty(
  $$ select * from projects where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  'Teacher A cannot see Teacher B''s project'
);

-- 3. Update on B's project silently changes nothing
update projects set name = 'Hacked'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

reset role;  -- back to postgres to check what really happened
select is(
  (select name from projects where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  'Bug Hunt B',
  'Teacher A cannot rename Teacher B''s project'
);

-- Switch back to Teacher A (the claims setting is still in place)
set local role authenticated;

-- 4. Cannot create a project owned by someone else
select throws_ok(
  $$ insert into projects (teacher_id, name, join_code)
     values ('22222222-2222-2222-2222-222222222222', 'Sneaky', 'XYZABC') $$,
  '42501', null,
  'Teacher A cannot create a project for Teacher B'
);

-- 5. Can create her own project
select lives_ok(
  $$ insert into projects (teacher_id, name, join_code)
     values ('11111111-1111-1111-1111-111111111111', 'Leaf Survey', 'WXYZAB') $$,
  'Teacher A can create her own project'
);

-- =========================================================
-- ACT AS A STUDENT WHO HAS NOT JOINED ANYTHING
-- =========================================================
reset role;
insert into auth.users (id, email, is_anonymous) values
  ('33333333-3333-3333-3333-333333333333', null, true);

set local role authenticated;
set local request.jwt.claims to
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated","is_anonymous":true}';

-- 6. A student with no membership sees no projects
select is_empty(
  $$ select * from projects $$,
  'Student who has not joined sees no projects'
);

-- =========================================================
-- NOT SIGNED IN
-- =========================================================
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

-- 7. Visitors who aren't signed in see nothing
select is_empty(
  $$ select * from projects $$,
  'Visitors who are not signed in see no projects'
);

select * from finish();
rollback;
```

### Why it's built this way

- **Three parts:** setup as `postgres`, then a block of tests per kind of user, then `finish()`. Keep that order in other test files.
- **The update test (#3)** doesn't raise an error, so the test switches back to `postgres` and checks that the row really didn't change.
- **The insert tests (#4 and #5)** come after the read tests. Otherwise the new "Leaf Survey" row would break test #1's expected results.
- **`''` inside a string** is how you write an apostrophe in SQL (`B''s`).
- **`null` in `throws_ok`** means "any error message is fine, as long as the code is `42501`."

### Check against the .sql file

Column names, whether `join_code` is generated automatically, and whether a trigger creates the `teachers` row may differ from what's assumed here. Adjust the setup block if it fails before the tests run. If `insert into auth.users` complains about a missing column, add it to the insert.

### Next exercise

Copy this pattern into `observations_rls.test.sql` and cover:
- Student 1, who has joined, can add an observation.
- Student 2 can't edit student 1's observation.
- Teacher B can't see observations in Teacher A's project.

Work out what `plan(n)` should be before starting.