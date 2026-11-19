// ==================================================
// The one Supabase connection the entire mobile app should use
// The URL and anon key are stored in the .env.local 
// Author: Kelcie 
// ==================================================

// ADD IMPORTS
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// ADD SUPABASE URL AND ANON KEY
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Fail if the URL or anon key are not set
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase settings. Create apps/mobile/.env.local with ' +
        'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
        '(see .env.example), then restart with: npx expo start --clear'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Phones keep the kid's anonymous sign-in in AsyncStorage so it
        // survives closing the app. In the browser (press w) Supabase uses
        // the browser's own storage instead.
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Refresh only while app is on screen, not in background
if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabase.auth.startAutoRefresh();
        } else {
            supabase.auth.stopAutoRefresh();
        }
    });
}
