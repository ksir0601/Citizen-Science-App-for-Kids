// Shared by ProjectPage, ResultsPage and HomePage: loading a project's data from the
// real database (lib/api.js) and turning observations into text.
import * as api from './lib/api.js';

// Supabase error codes that just mean "no such row" (or a bad id in the URL)
const NOT_FOUND = ['PGRST116', '22P02'];
const newestFirst = (a, b) => b.observed_at.localeCompare(a.observed_at);

// Loads one of the teacher's projects with its questions and observations (newest first).
// project is null if it doesn't exist or belongs to another teacher.
export async function loadProject(projectId) {
    const empty = { project: null, questions: [], observations: [] };
    const { data, error } = await api.getProjectResults(projectId);
    if (error) return { ...empty, error: NOT_FOUND.includes(error.code) ? '' : error.message };

    const { questions = [], observations = [], ...project } = data;
    return { project, questions, observations: [...observations].sort(newestFirst), error: '' };
}

// Loads all of the teacher's projects and every observation in them, newest first (for HomePage).
export async function loadHome() {
    const [projects, observations] = await Promise.all([api.getMyProjects(), api.getRecentObservations()]);
    const error = projects.error || observations.error;
    if (error) return { projects: [], observations: [], error: error.message };
    return { projects: projects.data, observations: observations.data, error: '' };
}

export const questionTypeLabels = {
    checkbox: 'Yes / No',
    dropdown: 'Dropdown',
    number: 'Number',
    text: 'Text',
};

export function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// True when the student skipped the question
export function isBlank(value) {
    return value === undefined || value === null || value === '';
}

// Turns one answer into text. 'blank' is what to show for a skipped question.
export function formatAnswer(question, value, blank) {
    if (isBlank(value)) return blank;
    if (question.type === 'checkbox') return value ? 'Yes' : 'No';
    return String(value);
}

// Names every student who didn't give a nickname "Student 1", "Student 2"... in the order they first submitted.
// Each student is one device id (created_by), so the same kid keeps the same number on every observation.
export function studentNames(observations) {
    const numbers = {};
    const names = {};
    const oldestFirst = [...observations].sort((a, b) => a.observed_at.localeCompare(b.observed_at));

    oldestFirst.forEach((o) => {
        if (o.nickname) {
            names[o.id] = o.nickname;
            return;
        }
        if (!numbers[o.created_by]) numbers[o.created_by] = Object.keys(numbers).length + 1;
        names[o.id] = `Student ${numbers[o.created_by]}`;
    });
    return names;
}
