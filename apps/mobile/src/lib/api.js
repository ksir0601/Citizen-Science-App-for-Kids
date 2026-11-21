// ===============================================
// Real API calls to Supabase, same functions as the mock API
// Every function returns {data, error}. Always check error. 
// Kids never see classes
// Author: Kelcie 
//=============================================
import { supabase } from './supabaseClient';

//=============================================
// SIGNING IN 
//=============================================

// CAll once when app opens, reuse last time's sign on
// Otherwise sign in anonymously
// signInAs() is replaced by startKidsSession() and must be called before joinProject() or getMyProjects(
export async function startKidsSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { data: null, error };
    if (data.session) return { data: data.session.user, error: null };
    
    const result = await supabase.auth.signInAnonymously();
    return { data: result.data?.user ?? null, error: result.error };
}

//=============================================
// PROJECTS
//=============================================

// Join a project with its code, returns project
// Calls the join_project() in migration file
// A wrong or closed code returns an error. 
export async function joinProject(code) {
    const cleaned = (code ?? '').trim().toUpperCase();
    if (cleaned.length !==6) {
        return {data: null, error: { message: 'Project code must be 6 characters' }
        };
    }
    return supabase.rpc('join_project', { p_code: cleaned });
}

// Projects this device has already joined, newest first. 
// Usefol for a "my projects" cream when the app reopens. 
export async function getMyProjects() {
    return supabase
        .from('projects')
        .select('id, name, description, is_open')
        .order('created_at', { ascending: false });
}

// One project's questions in order
export async function getQuestions(projectId) {
    return supabase
        .from('questions')
        .select('id, position, type, label, options, required')
        .eq('project_id', projectId)
        .order('position');
}

//=============================================
// Observations 
//=============================================

// Save new observation. created_by is filled by database
// answers = { [questionId]: true/false | "Robin" | 3 | "some text"}
export async function addObservation(projectId, nickname, answers) {
    return supabase
        .from('observations')
        .insert({ project_id: projectId, nickname: nickname?.trim() || null, answers })
        .select()
        .single();
}

// This kid's own observations for one project, newest first. 
// (RLS only return srows this device created.)
export async function getMyObservations(projectId) {
    return supabase
        .from('observations')
        .select('id, nickname, answers, observed_at, updated_at')
        .eq('project_id', projectId)
        .order('observed_at', { ascending: false });
}

// Edit one of this kid's observations. update_at chagnes automaticall
// changes = {nickname?, answers?}
export async function updateObservation(observationId, changes) {
    return supabase
        .from('observations')
        .update(changes)
        .eq('id', observationId)
        .select()
        .single();
}
