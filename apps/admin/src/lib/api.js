// ===============================================
// Author: Kelcie
// Real API calls for teacher admin website, same functions as the mock API
// Login/logout handled by AuthContex.jsx, not this file
// ===============================================
import { supabase } from '../Supabase.js';

// Signed in teacher's projects 
export async function getMyProjects() {
    return supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
}
// Create a project, then its questions
export async function createProject(name, description, questions) {
    if (!name || !name.trim()) return { data: null, error: { message: 'Please give the project a name' } }; 
    if (questions.length === 0) return { data: null, error: { message: 'Please add at least one question' } }; 

    const { data: project, error } = await supabase
        .from('projects')
        .insert({ name: name.trim(), description })
        .select()
        .single();
    if (error) return { data: null, error };

    const rows = questions.map((q, index) => ({
        project_id: project.id,
        position: index + 1,
        type: q.type,
        label: q.label,
        options: q.options === 'dropdown' ? q.options : null,
        required: q.required ?? false,
    }));
    const result = await supabase.from('questions').insert(rows);
    if (result.error) return { data: null, error: result.error };

    return { data: project, error: null };
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
