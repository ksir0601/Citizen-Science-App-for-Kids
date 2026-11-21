// ===============================================
// Author: Kelcie
// Real API calls for teacher admin website, same functions as the mock API
//
// Supabase already returns {data, error}, so most functions jsut return its answer. 
// Always check "error" in the page. 
// The RLS rules decide what each teacher can see.
// Login/logout handled by AuthContex.jsx, not this file
// ===============================================
import { supabase } from '../Supabase.js';

//=============================================
// CLASSES
//=============================================

// The teacher's classes, A to Z, with their projects and observation
// counts. Used by the Navbar sidebar.
export async function getMyClasses() {
  return supabase
    .from('classes')
    .select('id, name, student_count, created_at, projects(id, name, join_code, is_open, observations(count))')
    .order('name', { ascending: true });
}

// One class with its projects. Used by ClassPage.jsx.
export async function getClass(classId) {
  return supabase
    .from('classes')
    .select('id, name, student_count, projects(id, name, join_code, is_open, created_at)')
    .eq('id', classId)
    .single();
}

// Create a class. teacher_id is filled in by the database.
// studentCount is optional (1-500).
export async function createClass(name, studentCount = null) {
  if (!name || !name.trim()) {
    return { data: null, error: { message: 'Please give the class a name.' } };
  }
  return supabase
    .from('classes')
    .insert({ name: name.trim(), student_count: studentCount })
    .select()
    .single();
}

// Rename a class or change its student count.
// changes = { name?, student_count? }
export async function updateClass(classId, changes) {
  return supabase
    .from('classes')
    .update(changes)
    .eq('id', classId)
    .select()
    .single();
}

// Delete a class. Its projects are KEPT and become "no class"
// (class_id = null), because of ON DELETE SET NULL.
export async function deleteClass(classId) {
  return supabase.from('classes').delete().eq('id', classId);
}

//=============================================
// PROJECTS
//=============================================

// Signed in teacher's projects, newest first. 
// classId: a class id for one class, 'none' for projects with no class,
// or leave it out for all projects.
export async function getMyProjects(classId) {
    let query = supabase
        .from('projects')
        .select('*, classes(id, name), observations(count)')
        .order('created_at', { ascending: false });
    if (classId === 'none') {
        query = query.is('class_id', null);
    } else if (classId) {
        query = query.eq('class_id', classId);
    }
    return query;
}

// Create a project, then its questions
// Database fills in id, teacher_id, and join_code
export async function createProject(name, description, questions, classId = null) {
  if (!name || !name.trim()) {
    return { data: null, error: { message: 'Please give the project a name.' } };
  }
  if (!questions || questions.length === 0) {
    return { data: null, error: { message: 'Please add at least one question.' } };
  }

  // 1. Save the project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name: name.trim(), description, class_id: classId })
    .select('id, name, join_code, class_id')
    .single();
  if (error) return { data: null, error };

  // 2. Save its questions, numbered 1, 2, 3
  const rows = questions.map((q, index) => ({
    project_id: project.id,
    position: index + 1,
    type: q.type,
    label: q.label,
    options: q.type === 'dropdown' ? q.options : null,
    required: q.required ?? false,
  }));
  const { error: questionError } = await supabase.from('questions').insert(rows);
  if (questionError) {
    // Don't leave a project with no questions behind
    await supabase.from('projects').delete().eq('id', project.id);
    return { data: null, error: questionError };
  }

  return { data: project, error: null };
}

// Move a project to another class, or out of all classes (classId = null).
export async function moveProjectToClass(projectId, classId) {
  return supabase
    .from('projects')
    .update({ class_id: classId })
    .eq('id', projectId)
    .select()
    .single();
}

// open or close project 
export async function setProjectOpen(projectId, isOpen) {
    return supabase
        .from('projects')
        .update({ is_open: isOpen })
        .eq('id', projectId)
        .select()
        .single();  
}

// Delete a project. Its questions and observations are deleted with it
export async function deleteProject(projectId) {
  return supabase.from('projects').delete().eq('id', projectId);
}

//=============================================
// RESULTS (results page, charts, CSV)
//=============================================

// One project with its questions, in order, and all its observations
// (oldest first). Everything the results page and the CSV need.
export async function getProjectResults(projectId) {
  return supabase
    .from('projects')
    .select(`id, name, description, join_code, is_open, classes(id, name),
      questions(id, position, type, label, options),
      observations(id, nickname, answers, observed_at)`)
    .eq('id', projectId)
    .order('position', { referencedTable: 'questions' })
    .order('observed_at', { referencedTable: 'observations' })
    .single();
}

// Delete one observation ( a silly or duplicate entry)
export async function deleteObservation(observationId) {
  return supabase.from('observations').delete().eq('id', observationId);
}

// Turn getProjectResults() data into CSV text.
// One row per observation, one column per question (header = label).
// Not a database call, so it returns the text directly.
export function makeResultsCsv(results) {
  const questions = results.questions ?? [];
  const observations = results.observations ?? [];

  // Wrap every cell in quotes and double any quotes inside it.
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