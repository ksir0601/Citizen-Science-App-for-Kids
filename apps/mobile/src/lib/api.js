// ===============================================
// real API calls to Supabase, same functions as the mock API
// Author: Kelcie 
//=============================================
import { supabase } from './supabaseClient';

// CAll once when app opens, resuse last time's sign on
// Otherwise sign in anonymously
// signInAs() is replaced by startKidsSession() and must be called before joinProject() or getMyProjects(
export async function startKidsSession() {
    const { data } = await supabase.auth.getSession();
    if (data.session) return { data: data.session.user, error: null };
    return supabase.auth.signInAnonymously();
}

// Join a project with its code, returns project
// Calls the join_project() in migration file
export async function joinProject(code) {
    return supabase.rpc('join_project', { p_code: code });
}

// One project's questions in order
export async function getQuestions(projectId) {
    return supabase
        .from('questions')
        .select('*')
        .eq('project_id', projectId)
        .order('position');
}

// Save observation. created_by is filled by database
export async function addObservation(projectId, nickname, answers) {
    return supabase
        .from('observations')
        .insert({ project_id: projectId, nickname: nickname || null, answers })
        .select()
        .single();
}
