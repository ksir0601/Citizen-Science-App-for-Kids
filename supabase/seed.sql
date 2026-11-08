-- =====================================================================
-- TEST DATA for local and CI databases.
-- Runs automaticaly after the migrations on `supabase start`,
-- `supabase db reset`, and in CI. It never runs on the real project.
--
-- Logins (local only):  teacher1@test.local / password123
--                       teacher2@test.local   / password123
-- Join codes: BUGCNT (open), WEATHR (open), TREHNT (closed)
--
-- DO not change file, have Kelcie change. The same ids are in mock/mockData.js. 
--   1000...  teachers      2000...  kids
--   3000...  projects      4000...  questions
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TEACHERS: login users with an email and password.
-- Your signup trigger sees these and creates their teachers rows.
-- The extra columns are what Supabase's login system expects.
-- ---------------------------------------------------------------------
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, is_anonymous, created_at, updated_at,
   confirmation_token, recovery_token, email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'teacher1@test.local', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Teacher 1"}',
   false, now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'teacher2@test.local', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Teacher 2"}',
   false, now(), now(), '', '', '', '');

-- Each email user also needs an "identity" row to be able to log in.
insert into auth.identities
  (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', now(), now(), now()
from auth.users u
where u.email like '%@test.local';


-- ---------------------------------------------------------------------
-- 2. Kids: anonymous users (no email, no password).
-- The signup trigger skips them, so they never become teachers.
-- ---------------------------------------------------------------------
insert into auth.users (instance_id, id, aud, role, is_anonymous, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', true, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', true, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', true, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', true, now(), now());


-- ---------------------------------------------------------------------
-- 3. PROJECTS: two open ones for Teacher 1, one closed one for Teacher 2.
-- We set the join codes ourselves so they're easy to remember.
-- ---------------------------------------------------------------------
insert into public.projects (id, teacher_id, name, description, join_code, is_open)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Backyard Bug Count',
   'Explore your backyard or schoolyard for 10 minutes. Look under leaves, on flowers and near rocks. Count the bugs you find and tell us what kind they are. Look, but don''t touch!',
   'BUGCNT', true),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'Weather Watchers',
   'Step outside at lunchtime. Look at the sky, check the temperature, and tell us what you notice.',
   'WEATHR', true),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002',
   'Fall Leaf Hunt',
   'Collect fallen leaves on the playground and sort them by color.',
   'TREHNT', false);

-- ---------------------------------------------------------------------
-- 4. QUESTIONS: every type appears (checkbox, dropdown, number, text).
-- Question ids end in <project><position>: ...0102 = project 1, question 2.
-- ---------------------------------------------------------------------
insert into public.questions (id, project_id, position, type, label, options, required)
values
  -- Backyard Bug Count
  ('40000000-0000-0000-0000-000000000101', '30000000-0000-0000-0000-000000000001', 1, 'checkbox', 'Did you find any bugs?', null, true),
  ('40000000-0000-0000-0000-000000000102', '30000000-0000-0000-0000-000000000001', 2, 'dropdown', 'What kind of bug?', array['Ant', 'Ladybug', 'Bee', 'Butterfly', 'Beetle', 'Spider', 'Other'], true),
  ('40000000-0000-0000-0000-000000000103', '30000000-0000-0000-0000-000000000001', 3, 'number', 'How many did you see?', null, true),
  ('40000000-0000-0000-0000-000000000104', '30000000-0000-0000-0000-000000000001', 4, 'text', 'Where did you find it?', null, false),
  -- Weather Watchers
  ('40000000-0000-0000-0000-000000000201', '30000000-0000-0000-0000-000000000002', 1, 'dropdown', 'What does the sky look like?', array['Sunny', 'Partly cloudy', 'Cloudy', 'Rainy'], true),
  ('40000000-0000-0000-0000-000000000202', '30000000-0000-0000-0000-000000000002', 2, 'number', 'Temperature (°F)', null, true),
  ('40000000-0000-0000-0000-000000000203', '30000000-0000-0000-0000-000000000002', 3, 'checkbox', 'Is it raining right now?', null, false),
  ('40000000-0000-0000-0000-000000000204', '30000000-0000-0000-0000-000000000002', 4, 'text', 'Anything else you noticed?', null, false),
  -- Fall Leaf Hunt
  ('40000000-0000-0000-0000-000000000301', '30000000-0000-0000-0000-000000000003', 1, 'dropdown', 'What color are most of your leaves?', array['Red', 'Orange', 'Yellow', 'Brown'], true),
  ('40000000-0000-0000-0000-000000000302', '30000000-0000-0000-0000-000000000003', 2, 'number', 'How many leaves did you collect?', null, true);


-- ---------------------------------------------------------------------
-- 5. MEMBERS: which kids joined which project with its code.
--   kid 1: Bug Count + Weather    kid 2: Bug Count only
--   kid 3: Bug Count + Weather    kid 4: Leaf Hunt (before it closed)
-- ---------------------------------------------------------------------
insert into public.project_members (project_id, user_id)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004');

-- ---------------------------------------------------------------------
-- 6. OBSERVATIONS: 20 in total.
-- generate_series(1, 4) makes the numbers 1, 2, 3, 4, so each insert
-- below adds one row per number. "g" is that number: we use it to vary
-- the answers and to space the dates one day apart.
-- answers = { "<question id>": <answer> }
-- ---------------------------------------------------------------------

-- Bug Count, kid 1 "Maya": 4 observations
insert into public.observations (project_id, created_by, nickname, answers, observed_at)
select '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Maya',
       jsonb_build_object(
         '40000000-0000-0000-0000-000000000101', true,
         '40000000-0000-0000-0000-000000000102', (array['Ant', 'Ladybug', 'Bee', 'Butterfly'])[g],
         '40000000-0000-0000-0000-000000000103', g * 2,
         '40000000-0000-0000-0000-000000000104', 'Under a rock'),
       now() - g * interval '1 day'
from generate_series(1, 4) as g;

-- Bug Count, kid 2 (no nickname, skipped the optional "where" question): 3 observations
insert into public.observations (project_id, created_by, nickname, answers, observed_at)
select '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', null,
       jsonb_build_object(
         '40000000-0000-0000-0000-000000000101', true,
         '40000000-0000-0000-0000-000000000102', 'Ladybug',
         '40000000-0000-0000-0000-000000000103', g),
       now() - g * interval '1 day'
from generate_series(1, 3) as g;

-- Bug Count, kid 3 "Leo" (found no bugs): 3 observations
insert into public.observations (project_id, created_by, nickname, answers, observed_at)
select '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Leo',
       jsonb_build_object(
         '40000000-0000-0000-0000-000000000101', false,
         '40000000-0000-0000-0000-000000000102', 'Other',
         '40000000-0000-0000-0000-000000000103', 0,
         '40000000-0000-0000-0000-000000000104', 'Too cold today'),
       now() - g * interval '1 day'
from generate_series(1, 3) as g;

-- Weather Watchers, kid 1 "Maya": 3 observations
insert into public.observations (project_id, created_by, nickname, answers, observed_at)
select '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Maya',
       jsonb_build_object(
         '40000000-0000-0000-0000-000000000201', (array['Sunny', 'Partly cloudy', 'Cloudy'])[g],
         '40000000-0000-0000-0000-000000000202', 50 + g * 3,
         '40000000-0000-0000-0000-000000000203', false,
         '40000000-0000-0000-0000-000000000204', 'Windy'),
       now() - g * interval '1 day'
from generate_series(1, 3) as g;

-- Weather Watchers, kid 3 "Leo" (skipped the optional note): 3 observations
insert into public.observations (project_id, created_by, nickname, answers, observed_at)
select '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Leo',
       jsonb_build_object(
         '40000000-0000-0000-0000-000000000201', 'Rainy',
         '40000000-0000-0000-0000-000000000202', 45 + g,
         '40000000-0000-0000-0000-000000000203', true),
       now() - g * interval '1 day'
from generate_series(1, 3) as g;

-- Leaf Hunt, kid 4 "Sam": 4 observations (made before the project closed)
insert into public.observations (project_id, created_by, nickname, answers, observed_at)
select '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'Sam',
       jsonb_build_object(
         '40000000-0000-0000-0000-000000000301', (array['Red', 'Orange', 'Yellow', 'Brown'])[g],
         '40000000-0000-0000-0000-000000000302', g * 3),
       now() - (g + 7) * interval '1 day'
from generate_series(1, 4) as g;
