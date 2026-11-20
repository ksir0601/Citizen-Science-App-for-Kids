// Shared by ProjectPage and ResultsPage: loading a project's data and turning observations into text
import * as api from './mock/mockApi.js';
import * as mock from './mock/mockData.js';

// PLACEHOLDER
async function getObservations(projectId) {
    const data = mock.observations
        .filter((o) => o.project_id === projectId)
        .sort((a, b) => b.observed_at.localeCompare(a.observed_at));
    return { data, error: null };
}

// Loads one of the teacher's projects with its questions and observations.
// project is null if it doesn't exist or belongs to another teacher.
export async function loadProject(projectId) {
    const [projects, questions, observations] = await Promise.all([
        api.getMyProjects(),
        api.getQuestions(projectId),
        getObservations(projectId),
    ]);

    return {
        project: projects.data?.find((p) => p.id === projectId) || null,
        questions: questions.data || [],
        observations: observations.data || [],
        error: projects.error?.message || questions.error?.message || observations.error?.message || '',
    };
}

// Loads all of the teacher's projects and every observation in them, newest first (for HomePage).
export async function loadHome() {
    const projects = await api.getMyProjects();
    if (projects.error) return { projects: [], observations: [], error: projects.error.message };

    const results = await Promise.all(projects.data.map((p) => getObservations(p.id)));
    const failed = results.find((r) => r.error);
    const observations = results
        .flatMap((r) => r.data || [])
        .sort((a, b) => b.observed_at.localeCompare(a.observed_at));

    return { projects: projects.data, observations, error: failed?.error.message || '' };
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
