// =====================================================================
// MOCK API: test versions of the functions the website and app need 
//
// Every function returns { data, error }, the same shape Supabase uses:
//   success -> { data: <the result>, error: null }
//   problem -> { data: null, error: { message: '...' } }
//
// Kelcie TODO after database testing to link to actual project:
//   import * as api from './mock/mockApi.js';   // now
//   import * as api from './lib/api.js';        // after
// =====================================================================
import * as mock from './mockData.js';

// Copies of the lists, so adding rows doesn't change mockData.js.
// Reloading the page or app resets everything.
const db = {
  projects: [...mock.projects],
  questions: [...mock.questions],
  projectMembers: [...mock.projectMembers],
  observations: [...mock.observations],
};

// Who is "signed in" right now. Starts as teacher1.
let currentUserId = mock.teachers[0].id;

// Pretend the network takes half a second, so you build loading states.
const wait = () => new Promise((resolve) => setTimeout(resolve, 500));
const ok = (data) => ({ data, error: null });
const fail = (message) => ({ data: null, error: { message } });


// ---------------------------------------------------------------------
// Testing helper (mock only): choosewho is signed in
//   signInAs('teacher1')  signInAs('teacher2')  signInAs('kid1') ... ('kid4')
//   signInAs('new')  = a teacher with no projects, or a fresh app install
// ---------------------------------------------------------------------
export function signInAs(who) {
  const ids = {
    teacher1: mock.teachers[0].id,
    teacher2: mock.teachers[1].id,
    kid1: mock.kids[0].id,
    kid2: mock.kids[1].id,
    kid3: mock.kids[2].id,
    kid4: mock.kids[3].id,
    new: crypto.randomUUID(),
  };
  currentUserId = ids[who];
}


// ---------------------------------------------------------------------
// Teacher Admin website (Alice)
// ---------------------------------------------------------------------

// the signed in teacher's projects, newest first
export async function getMyProjects() {
  await wait();
  const mine = db.projects
    .filter((p) => p.teacher_id === currentUserId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return ok(mine);
}

// create a project and its questions
// questions = [{ type, label, options, required }, ...]
export async function createProject(name, description, questions) {
  await wait();
  if (!name || !name.trim()) return fail('Please give the project a name.');
  if (questions.length === 0) return fail('Please add at least one question.');

  const project = {
    id: crypto.randomUUID(),
    teacher_id: currentUserId,
    name: name.trim(),
    description,
    join_code: makeJoinCode(),
    is_open: true,
    created_at: new Date().toISOString(),
  };
  db.projects.push(project);

  questions.forEach((q, index) => {
    db.questions.push({
      id: crypto.randomUUID(),
      project_id: project.id,
      position: index + 1,
      type: q.type,
      label: q.label,
      options: q.type === 'dropdown' ? q.options : null,
      required: q.required ?? false,
    });
  });

  return ok(project);
}

// open or close a project
export async function setProjectOpen(projectId, isOpen) {
  await wait();
  const project = db.projects.find((p) => p.id === projectId && p.teacher_id === currentUserId);
  if (!project) return fail('Project not found.');
  project.is_open = isOpen;
  return ok(project);
}


// ---------------------------------------------------------------------
// Student Mobile App (Thomas)
// ---------------------------------------------------------------------

// join a project with its code. Returns the project
export async function joinProject(code) {
  await wait();
  const cleanCode = code.trim().toUpperCase();
  const project = db.projects.find((p) => p.join_code === cleanCode && p.is_open);
  if (!project) return fail('That code did not match an open project');

  const alreadyJoined = db.projectMembers.some(
    (m) => m.project_id === project.id && m.user_id === currentUserId,
  );
  if (!alreadyJoined) {
    db.projectMembers.push({ project_id: project.id, user_id: currentUserId });
  }
  return ok(project);
}

// one project's questions, in order.
export async function getQuestions(projectId) {
  await wait();
  const list = db.questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position);
  return ok(list);
}

// save an observation. answers = { questionId: answer }
export async function addObservation(projectId, nickname, answers) {
  await wait();
  const observation = {
    id: crypto.randomUUID(),
    project_id: projectId,
    created_by: currentUserId,
    nickname: nickname || null,
    answers,
    observed_at: new Date().toISOString(),
  };
  db.observations.push(observation);
  return ok(observation);
}


// ---------------------------------------------------------------------
// Private helper: 6 random letters, skipping I, L and O
// (the same rule as generate_join_code() in the database).
// ---------------------------------------------------------------------
function makeJoinCode() {
  const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}