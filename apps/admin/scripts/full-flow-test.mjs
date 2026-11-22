// ==================================================
// Full-flow test: website -> database -> app -> database -> website,
// without any pages. Makes the same supabase-js calls the website and app
// make, with the same public key, so the same RLS rules apply.
//
// Run from apps/admin (it uses that folder's supabase-js and .env.local):
//   node --env-file=.env.local scripts/full-flow-test.mjs
//
// Needs: supabase start, the seed loaded (supabase db reset), and
// enable_anonymous_sign_ins = true in supabase/config.toml.
// Only for local or dev databases: it creates a test teacher each run.
//
// Author: Kelcie
// ==================================================
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Run with --env-file=.env.local');
  process.exit(1);
}

// Each "person" gets their own client, like separate browsers/phones
const newClient = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let failures = 0;
function check(name, passed, detail) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${!passed && detail ? `\n     ${detail}` : ''}`);
  if (!passed) failures++;
  return passed;
}
const msg = (error) => error?.message ?? 'no error message';

// ---------- 1. Teacher on the website ----------
const teacher = newClient();
const email = `flowtest+${Date.now()}@test.local`;
const signUp = await teacher.auth.signUp({
  email,
  password: 'FlowTest-2026!',
  options: { data: { display_name: 'Flow Test Teacher' } },
});
if (!check('Teacher signs up', !signUp.error && signUp.data.session, signUp.error
    ? msg(signUp.error)
    : 'no session: turn off email confirmations for local testing)')) process.exit(1);

const cls = await teacher.from('classes')
  .insert({ name: 'Flow Test Class', student_count: 20 })
  .select().single();
check('Teacher creates a class', !cls.error, msg(cls.error));

const project = await teacher.from('projects')
  .insert({ name: 'Flow Test Project', description: 'Testing the full flow', class_id: cls.data?.id })
  .select('id, join_code').single();
if (!check('Teacher creates a project in that class', !project.error, msg(project.error))) process.exit(1);
check('Database made a 6-letter join code', /^[A-Z]{6}$/.test(project.data.join_code ?? ''),
  `got: ${project.data.join_code}`);
console.log(`     join code: ${project.data.join_code}`);

const questions = await teacher.from('questions').insert([
  { project_id: project.data.id, position: 1, type: 'checkbox', label: 'Did you see a bird?', required: true },
  { project_id: project.data.id, position: 2, type: 'dropdown', label: 'What kind?', options: ['Robin', 'Crow', 'Other'], required: false },
  { project_id: project.data.id, position: 3, type: 'number', label: 'How many?', required: true },
  { project_id: project.data.id, position: 4, type: 'text', label: 'What were they doing?', required: false },
]).select('id, position');
check('Teacher adds 4 questions (one of each type)', !questions.error && questions.data.length === 4, msg(questions.error));

// ---------- 2. Kid on the app ----------
const kid = newClient();
const anon = await kid.auth.signInAnonymously();
if (!check('Kid signs in anonymously', !anon.error, msg(anon.error) +
  ' (set enable_anonymous_sign_ins = true in config.toml, then supabase stop && supabase start)')) process.exit(1);

const peek = await kid.from('projects').select('id');
check('Before joining, kid sees no projects', !peek.error && peek.data.length === 0,
  peek.error ? msg(peek.error) : `saw ${peek.data.length}`);

const joined = await kid.rpc('join_project', { p_code: project.data.join_code });
check('Kid joins with the code', !joined.error && joined.data?.id === project.data.id, msg(joined.error));

const kidQs = await kid.from('questions').select('*').eq('project_id', project.data.id).order('position');
check('Kid loads the 4 questions in order', !kidQs.error && kidQs.data.map((q) => q.position).join() === '1,2,3,4',
  msg(kidQs.error));

const byPos = Object.fromEntries((kidQs.data ?? []).map((q) => [q.position, q.id]));
const answers = { [byPos[1]]: true, [byPos[2]]: 'Robin', [byPos[3]]: 3, [byPos[4]]: 'Eating berries' };
const obs = await kid.from('observations')
  .insert({ project_id: project.data.id, nickname: 'Sam', answers })
  .select().single();
check('Kid submits an observation', !obs.error, msg(obs.error));

const kidEdit = await kid.from('observations')
  .update({ answers: { ...answers, [byPos[3]]: 4 } })
  .eq('id', obs.data?.id).select();
check('Kid can edit their own observation', !kidEdit.error && kidEdit.data.length === 1, msg(kidEdit.error));

const kidClasses = await kid.from('classes').select('id');
check('Kid cannot see any classes', !kidClasses.error && kidClasses.data.length === 0,
  kidClasses.error ? msg(kidClasses.error) : `saw ${kidClasses.data.length}`);

const closed = await kid.rpc('join_project', { p_code: 'TREHNT' });
check('Kid cannot join a closed project (TREHNT)', !!closed.error, 'join succeeded but should have failed');

// ---------- 3. Teacher sees the result on the website ----------
const results = await teacher.from('observations').select('nickname, answers').eq('project_id', project.data.id);
check('Teacher sees the observation with the edited answer',
  !results.error && results.data.length === 1 && results.data[0].answers[byPos[3]] === 4,
  results.error ? msg(results.error) : JSON.stringify(results.data));

const sidebar = await teacher.from('classes').select('id, name, projects(id, name, observations(count))');
const sideCount = sidebar.data?.[0]?.projects?.[0]?.observations?.[0]?.count;
check('Sidebar query shows class -> project -> 1 observation', !sidebar.error && sideCount === 1,
  sidebar.error ? msg(sidebar.error) : JSON.stringify(sidebar.data));

// ---------- 4. Another teacher sees none of it ----------
const other = newClient();
const otherLogin = await other.auth.signInWithPassword({ email: 'teacher2@test.local', password: 'password123' });
if (check('Teacher 2 logs in (seed account)', !otherLogin.error, msg(otherLogin.error))) {
  const leak = await other.from('projects').select('id').eq('id', project.data.id);
  check('Teacher 2 cannot see the new project', !leak.error && leak.data.length === 0,
    leak.error ? msg(leak.error) : 'project was visible');
  const leakObs = await other.from('observations').select('id').eq('project_id', project.data.id);
  check('Teacher 2 cannot see its observations', !leakObs.error && leakObs.data.length === 0,
    leakObs.error ? msg(leakObs.error) : 'observations were visible');
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
