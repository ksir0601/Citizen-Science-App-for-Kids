// Anonymous sign in with supabase

import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

let pending: Promise<Session | null> | null = null;

async function ensureSession(): Promise<Session | null> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (session) return session;
    
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.session;
}

export function useAnonymousSignIn() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => { let mounted = true;
        pending ??= ensureSession().finally(() => {
            pending = null
    });

        pending
            .then((s) => {
                if (mounted) setSession(s);
            })
            .catch((e: Error) => {
                if (mounted) setError(e);
            })
            .finally(() =>{
                if (mounted) setLoading(false);
            });
        
    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (mounted) setSession(newSession);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    }
}, []);

return { session, loading, error};

}