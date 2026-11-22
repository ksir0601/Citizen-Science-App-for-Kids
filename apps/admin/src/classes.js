// Classes for the pages, from the real database (lib/api.js).
// Same function names and data shapes as the mock version, so the pages don't change.
// The database's security rules (RLS) make sure a teacher only ever gets their own classes.
import * as api from './lib/api.js';

const fail = (message) => ({ data: null, error: { message } });

// Supabase error codes that just mean "no such row" (or a bad id in the URL)
const NOT_FOUND = ['PGRST116', '22P02'];

// The teacher's classes A to Z, each with its projects, plus a "No Class" group
// at the end for projects that aren't in a class. Used by the Navbar and NewProjectPage.
export async function getMyClasses() {
    const [classes, noClass] = await Promise.all([api.getMyClasses(), api.getMyProjects('none')]);
    const error = classes.error || noClass.error;
    if (error) return { data: null, error };

    const data = [...classes.data];
    if (noClass.data.length > 0) data.push({ id: 'no-class', name: 'No Class', projects: noClass.data });
    return { data, error: null };
}

// One class with its projects. data is null if it doesn't exist or belongs to another teacher.
export async function getClass(classId) {
    if (classId === 'no-class') return { data: null, error: null };
    const { data, error } = await api.getClass(classId);
    if (error && NOT_FOUND.includes(error.code)) return { data: null, error: null };
    return { data, error };
}

export async function createClass(name, studentCount) {
    if (!name || !name.trim()) return fail('Please give the class a name');
    if (name.trim().length > 100) return fail('Class names can be up to 100 characters');
    if (studentCount !== null && !(Number.isInteger(studentCount) && studentCount >= 1 && studentCount <= 500)) {
        return fail('Number of students must be a whole number from 1 to 500');
    }
    return api.createClass(name, studentCount);
}

// Creates the project and its questions. The database makes the join code
// and only accepts one of the teacher's own classes.
export async function createProjectInClass(name, description, questions, classId) {
    const realClassId = classId && classId !== 'no-class' ? classId : null;
    return api.createProject(name, description, questions, realClassId);
}