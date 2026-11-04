import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

// Teacher = admin
export function isAdmin(user) {
    return user?.app_metadata?.role === 'teacher';
}