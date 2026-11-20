// PLACEHOLDERS 
import * as api from './mock/mockApi.js';
import * as mock from './mock/mockData.js';

const teacherId = mock.teachers[0].id;
const classes = [...(mock.classes || [])];
const projectClasses = {};
const fail = (message) => ({ data: null, error: { message } });

function classOf(project) {
    return projectClasses[project.id] ?? project.class_id ?? null;
}

export async function getMyClasses() {
    const { data: projects, error } = await api.getMyProjects();
    if (error) return { data: null, error };

    const data = classes
        .filter((c) => c.teacher_id === teacherId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => ({ ...c, projects: projects.filter((p) => classOf(p) === c.id) }));

    const noClass = projects.filter((p) => !classOf(p));
    if (noClass.length > 0) data.push({ id: 'no-class', name: 'No Class', projects: noClass });

    return { data, error: null };
}

export async function getClass(classId) {
    const { data, error } = await getMyClasses();
    if (error) return { data: null, error };
    return { data: data.find((c) => c.id === classId && c.id !== 'no-class') || null, error: null };
}

export async function createClass(name, studentCount) {
    if (!name || !name.trim()) return fail('Please give the class a name');
    if (name.trim().length > 100) return fail('Class names can be up to 100 characters');
    if (studentCount !== null && !(Number.isInteger(studentCount) && studentCount >= 1 && studentCount <= 500)) {
        return fail('Number of students must be a whole number from 1 to 500');
    }

    const newClass = {
        id: crypto.randomUUID(),
        teacher_id: teacherId,
        name: name.trim(),
        student_count: studentCount,
        created_at: new Date().toISOString(),
    };
    classes.push(newClass);
    return { data: newClass, error: null };
}

// PLACEHOLDER 
export async function createProjectInClass(name, description, questions, classId) {
    if (classId && !classes.some((c) => c.id === classId && c.teacher_id === teacherId)) {
        return fail('Choose one of your own classes');
    }

    const { data: project, error } = await api.createProject(name, description, questions);
    if (error) return { data: null, error };

    projectClasses[project.id] = classId || null;
    return { data: { ...project, class_id: classId || null }, error: null };
}
