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

// Copies of the lists, so changes never touch mockData.js.
// Reloading the page or app resets everything.
const db = {
  classes: structuredClone(mock.classes),
  projects: structuredClone(mock.projects),
  questions: structuredClone(mock.questions),
  projectMembers: structuredClone(mock.projectMembers),
  observations: structuredClone(mock.observations),
};

// Who is "signed in" right now. Starts as teacher1.
let currentUserId = mock.teachers[0].id;
let currentRole = 'teacher'; // 'teacher' | 'kid' | 'new'

// Pretend the network takes half a second, so you build loading states.
const wait = () => new Promise((resolve) => setTimeout(resolve, 500));
const ok = (data) => ({ data, error: null });
const fail = (message) => ({ data: null, error: { message } });
const now = () => new Date().toISOString();


// ---------------------------------------------------------------------
// Testing helper (mock only): choose who is signed in
//   signInAs('teacher1')  signInAs('teacher2')  signInAs('kid1') ... ('kid4')
//   signInAs('new')  = a teacher with no classes, or a fresh app install
// ---------------------------------------------------------------------
export function signInAs(who) {
  const people = {
    teacher1: [mock.teachers[0].id, 'teacher'],
    teacher2: [mock.teachers[1].id, 'teacher'],
    kid1: [mock.kids[0].id, 'kid'],
    kid2: [mock.kids[1].id, 'kid'],
    kid3: [mock.kids[2].id, 'kid'],
    kid4: [mock.kids[3].id, 'kid'],
    new: [crypto.randomUUID(), 'new'],
  };
  if (!people[who]) throw new Error(`Unknown mock user "${who}"`);
  [currentUserId, currentRole] = people[who];
}


// ---------------------------------------------------------------------
// Private helpers: the same rules as the RLS policies
// ---------------------------------------------------------------------
const ownsClass = (c) => c.teacher_id === currentUserId;
const ownsProject = (p) => p.teacher_id === currentUserId;
const isMember = (projectId) =>
  db.projectMembers.some((m) => m.project_id === projectId && m.user_id === currentUserId);

// Teachers see their own projects; kids see projects they've joined.
const canSeeProject = (p) => ownsProject(p) || isMember(p.id);

// Teachers see every observation in their projects; kids see their own.
const canSeeObservation = (o) => {
  const project = db.projects.find((p) => p.id === o.project_id);
  return (project && ownsProject(project)) || o.created_by === currentUserId;
};

const questionsFor = (projectId) =>
  db.questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position);

// Supabase returns counts as [{ count: n }], so the mock does too.
const observationCount = (projectId) => [
  { count: db.observations.filter((o) => o.project_id === projectId).length },
];

const classSummary = (c) => c && { id: c.id, name: c.name };


// =====================================================================
// TEACHER WEBSITE (Alice)
// =====================================================================

// ---------------------------------------------------------------------
// CLASSES
// ---------------------------------------------------------------------

// The teacher's classes, A to Z, with their projects and observation counts.
export async function getMyClasses() {
  await wait();
  const list = db.classes
    .filter(ownsClass)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      id: c.id,
      name: c.name,
      student_count: c.student_count,
      created_at: c.created_at,
      projects: db.projects
        .filter((p) => p.class_id === c.id && ownsProject(p))
        .map((p) => ({
          id: p.id,
          name: p.name,
          join_code: p.join_code,
          is_open: p.is_open,
          observations: observationCount(p.id),
        })),
    }));
  return ok(list);
}

// One class with its projects.
export async function getClass(classId) {
  await wait();
  const c = db.classes.find((row) => row.id === classId && ownsClass(row));
  if (!c) return fail('Class not found.');
  return ok({
    id: c.id,
    name: c.name,
    student_count: c.student_count,
    projects: db.projects
      .filter((p) => p.class_id === c.id && ownsProject(p))
      .map((p) => ({
        id: p.id,
        name: p.name,
        join_code: p.join_code,
        is_open: p.is_open,
        created_at: p.created_at,
      })),
  });
}

// Create a class. studentCount is optional (1-500), same as the database.
export async function createClass(name, studentCount = null) {
  await wait();
  if (!name || !name.trim()) return fail('Please give the class a name.');
  if (name.trim().length > 100) return fail('Class names can be up to 100 characters.');
  if (studentCount !== null && (studentCount < 1 || studentCount > 500)) {
    return fail('Number of students must be between 1 and 500.');
  }

  const newClass = {
    id: crypto.randomUUID(),
    teacher_id: currentUserId,
    name: name.trim(),
    student_count: studentCount,
    created_at: now(),
  };
  db.classes.push(newClass);
  return ok(newClass);
}

// Rename a class or change its student count. changes = { name?, student_count? }
export async function updateClass(classId, changes) {
  await wait();
  const c = db.classes.find((row) => row.id === classId && ownsClass(row));
  if (!c) return fail('Class not found.');

  if ('name' in changes) {
    if (!changes.name || !changes.name.trim()) return fail('Please give the class a name.');
    c.name = changes.name.trim();
  }
  if ('student_count' in changes) {
    const n = changes.student_count;
    if (n !== null && (n < 1 || n > 500)) return fail('Number of students must be between 1 and 500.');
    c.student_count = n;
  }
  return ok(c);
}

// Delete a class. Its projects are KEPT and become "no class" (class_id = null).
export async function deleteClass(classId) {
  await wait();
  const c = db.classes.find((row) => row.id === classId && ownsClass(row));
  if (c) {
    db.projects.forEach((p) => {
      if (p.class_id === classId) p.class_id = null;
    });
    db.classes = db.classes.filter((row) => row.id !== classId);
  }
  // Supabase doesn't report an error when nothing matched, so neither do we.
  return ok(null);
}


// ---------------------------------------------------------------------
// PROJECTS
// ---------------------------------------------------------------------

// Projects you can see, newest first.
//   Teacher: their own projects, with the class and observation count.
//            classId = a class id, 'none' for no class, or leave it out.
//   Kid:     projects this device has joined (the app's "My projects").
// The real website and app files have separate versions; this one mock
// covers both, the same way the database's rule does.
export async function getMyProjects(classId) {
  await wait();
  let list = db.projects.filter(canSeeProject);

  if (classId === 'none') list = list.filter((p) => p.class_id === null);
  else if (classId) list = list.filter((p) => p.class_id === classId);

  const rows = list
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((p) => ({
      ...p,
      classes: classSummary(db.classes.find((c) => c.id === p.class_id)) ?? null,
      observations: observationCount(p.id),
    }));
  return ok(rows);
}

// Create a project (optionally in a class), then its questions.
// questions = [{ type, label, options, required }, ...]
export async function createProject(name, description, questions, classId = null) {
  await wait();
  if (!name || !name.trim()) return fail('Please give the project a name.');
  if (!questions || questions.length === 0) return fail('Please add at least one question.');
  if (classId && !db.classes.some((c) => c.id === classId && ownsClass(c))) {
    return fail('You can only add projects to your own classes.');
  }

  const project = {
    id: crypto.randomUUID(),
    teacher_id: currentUserId,
    class_id: classId,
    name: name.trim(),
    description,
    join_code: makeJoinCode(),
    is_open: true,
    created_at: now(),
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

  // Same columns the real createProject reads back.
  return ok({ id: project.id, name: project.name, join_code: project.join_code, class_id: project.class_id });
}

// Move a project to another class, or out of all classes (classId = null).
export async function moveProjectToClass(projectId, classId) {
  await wait();
  const project = db.projects.find((p) => p.id === projectId && ownsProject(p));
  if (!project) return fail('Project not found.');
  if (classId && !db.classes.some((c) => c.id === classId && ownsClass(c))) {
    return fail('You can only move projects to your own classes.');
  }
  project.class_id = classId;
  return ok(project);
}

// Open or close a project.
export async function setProjectOpen(projectId, isOpen) {
  await wait();
  const project = db.projects.find((p) => p.id === projectId && ownsProject(p));
  if (!project) return fail('Project not found.');
  project.is_open = isOpen;
  return ok(project);
}

// Delete a project, with its questions, members and observations.
export async function deleteProject(projectId) {
  await wait();
  const project = db.projects.find((p) => p.id === projectId && ownsProject(p));
  if (project) {
    db.projects = db.projects.filter((p) => p.id !== projectId);
    db.questions = db.questions.filter((q) => q.project_id !== projectId);
    db.projectMembers = db.projectMembers.filter((m) => m.project_id !== projectId);
    db.observations = db.observations.filter((o) => o.project_id !== projectId);
  }
  return ok(null);
}


// ---------------------------------------------------------------------
// RESULTS (results page, charts, CSV)
// ---------------------------------------------------------------------

// One project with its questions (in order) and observations (oldest first).
export async function getProjectResults(projectId) {
  await wait();
  const p = db.projects.find((row) => row.id === projectId && canSeeProject(row));
  if (!p) return fail('Project not found.');

  return ok({
    id: p.id,
    name: p.name,
    description: p.description,
    join_code: p.join_code,
    is_open: p.is_open,
    classes: classSummary(db.classes.find((c) => c.id === p.class_id)) ?? null,
    questions: questionsFor(p.id).map(({ id, position, type, label, options }) =>
      ({ id, position, type, label, options })),
    observations: db.observations
      .filter((o) => o.project_id === p.id && canSeeObservation(o))
      .sort((a, b) => a.observed_at.localeCompare(b.observed_at))
      .map(({ id, nickname, answers, observed_at }) => ({ id, nickname, answers, observed_at })),
  });
}

// Delete one observation. Only the project's teacher can.
export async function deleteObservation(observationId) {
  await wait();
  const o = db.observations.find((row) => row.id === observationId);
  const project = o && db.projects.find((p) => p.id === o.project_id);
  if (project && ownsProject(project)) {
    db.observations = db.observations.filter((row) => row.id !== observationId);
  }
  return ok(null);
}

// Turn getProjectResults() data into CSV text. Same code as lib/api.js
// (it isn't a database call, so the mock and the real version match).
export function makeResultsCsv(results) {
  const questions = results.questions ?? [];
  const observations = results.observations ?? [];

  const cell = (value) => {
    if (value === null || value === undefined) return '""';
    const text = Array.isArray(value) ? value.join('; ') : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const header = ['Observed at', 'Nickname', ...questions.map((q) => q.label)];
  const rows = observations.map((o) => [
    o.observed_at,
    o.nickname ?? '',
    ...questions.map((q) => o.answers?.[q.id]),
  ]);

  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\n');
}


// =====================================================================
// KIDS' APP (Thomas)
// =====================================================================

// Call once when the app opens. If a kid is already "signed in", keep
// them; otherwise act like a fresh install with a new anonymous id.
export async function startKidsSession() {
  await wait();
  if (currentRole !== 'kid') {
    currentUserId = crypto.randomUUID();
    currentRole = 'kid';
  }
  return ok({ id: currentUserId, is_anonymous: true });
}

// Join a project with its 6-letter code. Returns the project.
export async function joinProject(code) {
  await wait();
  const cleaned = (code ?? '').trim().toUpperCase();
  if (cleaned.length !== 6) return fail('Project code must be 6 characters');

  const project = db.projects.find((p) => p.join_code === cleaned && p.is_open);
  if (!project) return fail('That code did not match an open project');

  if (!isMember(project.id)) {
    db.projectMembers.push({ project_id: project.id, user_id: currentUserId });
  }
  return ok({ id: project.id, name: project.name, description: project.description });
}

// One project's questions, in order. Empty if you can't see the project,
// the same as the database (RLS returns no rows rather than an error).
export async function getQuestions(projectId) {
  await wait();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project || !canSeeProject(project)) return ok([]);
  return ok(questionsFor(projectId));
}

// Save an observation. answers = { questionId: answer }
// Only works for joined projects that are still open.
export async function addObservation(projectId, nickname, answers) {
  await wait();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project || !isMember(projectId)) return fail('Join the project before adding observations.');
  if (!project.is_open) return fail('This project is closed.');

  const observation = {
    id: crypto.randomUUID(),
    project_id: projectId,
    created_by: currentUserId,
    nickname: nickname?.trim() || null,
    answers,
    observed_at: now(),
    updated_at: now(),
  };
  db.observations.push(observation);
  return ok(observation);
}

// This kid's own observations for one project, newest first.
export async function getMyObservations(projectId) {
  await wait();
  const list = db.observations
    .filter((o) => o.project_id === projectId && o.created_by === currentUserId)
    .sort((a, b) => b.observed_at.localeCompare(a.observed_at))
    .map(({ id, nickname, answers, observed_at, updated_at }) =>
      ({ id, nickname, answers, observed_at, updated_at: updated_at ?? observed_at }));
  return ok(list);
}

// Edit one of this kid's own observations. changes = { nickname?, answers? }
export async function updateObservation(observationId, changes) {
  await wait();
  const o = db.observations.find((row) => row.id === observationId && row.created_by === currentUserId);
  if (!o) return fail('Observation not found.');

  if ('nickname' in changes) o.nickname = changes.nickname?.trim() || null;
  if ('answers' in changes) o.answers = changes.answers;
  o.updated_at = now();
  return ok(o);
}


// ---------------------------------------------------------------------
// Private helper: 6 random letters, skipping I, L and O
// (the same rule as generate_join_code() in the database).
// ---------------------------------------------------------------------
function makeJoinCode() {
  const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  let code;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += letters[Math.floor(Math.random() * letters.length)];
    }
  } while (db.projects.some((p) => p.join_code === code));
  return code;
}
