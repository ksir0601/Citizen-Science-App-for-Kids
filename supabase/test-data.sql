-- =====================================================================
-- TEST DATA for the Citizen Science App for Kids
--
-- Creates 2 sample projects (with questions) and 35 sample observations
-- for one teacher, so the website and app have realistic data to show.
--
-- HOW TO USE
--   1. Sign up a test teacher on the admin website (e.g. test.teacher@example.com).
--   2. Change the email on the line marked  <-- CHANGE ME  below.
--   3. Supabase dashboard -> SQL Editor -> New query -> paste this file -> Run.
--   4. The "Messages" tab shows the two join codes.
--
-- Safe to run more than once: each run adds 2 more sample projects.
-- Only for testing. Do not run on a database real teachers are using.
-- =====================================================================

do $$
declare
  v_email   text := 'test.teacher@example.com';   -- <-- CHANGE ME

  v_teacher uuid;
  v_bugs   uuid;
  v_weather uuid;

  q_saw   uuid;
  q_kind  uuid;
  q_count uuid;
  q_note  uuid;

  w_sky   uuid;
  w_temp  uuid;
  w_rain  uuid;
  w_note  uuid;

  bug_kinds  text[] := array['Ant', 'Ladybug', 'Bee', 'Butterfly', 'Beetle', 'Spider', 'Other'];
  sky_kinds  text[] := array['Sunny', 'Partly cloudy', 'Cloudy', 'Rainy'];
  nicknames  text[] := array['Sam', 'Ana', 'Leo', 'Maya', 'Kai', 'Zoe'];
begin
  -- Find the test teacher
  select id into v_teacher from auth.users where email = v_email;
  if v_teacher is null then
    raise exception 'No account with email %. Sign up on the admin website first, then run this again.', v_email;
  end if;

  -- Make sure they have a teachers row (normally created at sign-up)
  insert into public.teachers (id, display_name)
  values (v_teacher, 'Test Teacher')
  on conflict (id) do nothing;

  -- -------------------------------------------------------------------
  -- Project 1: Backyard Bug Count
  -- -------------------------------------------------------------------
  insert into public.projects (teacher_id, name, description)
  values (
    v_teacher,
    'Backyard Bug Count',
    'Explore your backyard or schoolyard for 10 minutes. Look under leaves, on flowers and near rocks. Count the bugs you find and tell us what kind they are. Look, but don''t touch!'
  )
  returning id into v_bugs;

  insert into public.questions (project_id, position, type, label, required)
  values (v_bugs, 1, 'checkbox', 'Did you find any bugs?', true)
  returning id into q_saw;

  insert into public.questions (project_id, position, type, label, options, required)
  values (v_bugs, 2, 'dropdown', 'What kind of bug?', bug_kinds, true)
  returning id into q_kind;

  insert into public.questions (project_id, position, type, label, required)
  values (v_bugs, 3, 'number', 'How many did you see?', true)
  returning id into q_count;

  insert into public.questions (project_id, position, type, label)
  values (v_bugs, 4, 'text', 'Where did you find it?')
  returning id into q_note;

  insert into public.observations (project_id, nickname, answers, observed_at)
  select
    v_bugs,
    nicknames[1 + floor(random() * array_length(nicknames, 1))::int],
    jsonb_build_object(
      q_saw::text,   true,
      q_kind::text,  bug_kinds[1 + floor(random() * array_length(bug_kinds, 1))::int],
      q_count::text, 1 + floor(random() * 12)::int,
      q_note::text,  (array['Under a rock', 'On a flower', 'Crawling on a leaf', 'In the grass', 'On the sidewalk'])[1 + floor(random() * 5)::int]
    ),
    now() - random() * interval '14 days'
  from generate_series(1, 20);

  -- -------------------------------------------------------------------
  -- Project 2: Weather Watchers
  -- -------------------------------------------------------------------
  insert into public.projects (teacher_id, name, description)
  values (
    v_teacher,
    'Weather Watchers',
    'Step outside at lunchtime. Look at the sky, check the temperature, and tell us what you notice.'
  )
  returning id into v_weather;

  insert into public.questions (project_id, position, type, label, options, required)
  values (v_weather, 1, 'dropdown', 'What does the sky look like?', sky_kinds, true)
  returning id into w_sky;

  insert into public.questions (project_id, position, type, label, required)
  values (v_weather, 2, 'number', 'Temperature (°F)', true)
  returning id into w_temp;

  insert into public.questions (project_id, position, type, label)
  values (v_weather, 3, 'checkbox', 'Is it raining right now?')
  returning id into w_rain;

  insert into public.questions (project_id, position, type, label)
  values (v_weather, 4, 'text', 'Anything else you noticed?')
  returning id into w_note;

  insert into public.observations (project_id, nickname, answers, observed_at)
  select
    v_weather,
    nicknames[1 + floor(random() * array_length(nicknames, 1))::int],
    jsonb_build_object(
      w_sky::text,  sky_kinds[1 + floor(random() * array_length(sky_kinds, 1))::int],
      w_temp::text, 40 + floor(random() * 35)::int,
      w_rain::text, random() < 0.25,
      w_note::text, (array['Windy', 'Leaves falling', 'Very bright', 'Puddles on the ground', 'Cold hands'])[1 + floor(random() * 5)::int]
    ),
    now() - random() * interval '14 days'
  from generate_series(1, 15);

  -- -------------------------------------------------------------------
  -- Show the join codes
  -- -------------------------------------------------------------------
  raise notice 'Done! Backyard Bug Count code: %   Weather Watchers code: %',
    (select join_code from public.projects where id = v_bugs),
    (select join_code from public.projects where id = v_weather);
end;
$$;
