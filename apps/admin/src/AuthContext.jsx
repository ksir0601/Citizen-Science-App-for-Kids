import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from './Supabase';
import { AuthContext, useAuth, isAdmin } from './useAuth';

export function AuthProvider({ children }) {
    // undefined means its loading, null means signed out
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
        });
        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        user: session?.user ?? null,
        loading: session === undefined,
        signOut: () => supabase.auth.signOut(),
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAdmin({ children }) {
    const { session, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className='loading-page'>Loading...</div>;

    if (!session || !isAdmin (session.user)) {
        return <Navigate to='/login' replace state={{ from: location }} />;
    }
    return children;
}
