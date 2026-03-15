import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken, clearAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: try to restore session via silent refresh
    useEffect(() => {
        const restoreSession = async () => {
            const userData = localStorage.getItem('user');
            if (!userData) {
                setLoading(false);
                return;
            }

            try {
                // Attempt silent refresh — cookie is sent automatically
                const { data } = await api.post('/auth/refresh-token');
                setAccessToken(data.data.accessToken);

                // Fetch latest profile to ensure photo and name are up to date
                const profileRes = await api.get('/auth/profile');
                setUser(profileRes.data.data);
                localStorage.setItem('user', JSON.stringify(profileRes.data.data));
            } catch {
                // Refresh failed — session expired
                localStorage.removeItem('user');
                clearAccessToken();
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = (data) => {
        setAccessToken(data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Logout API failed — clear local state anyway
        }
        clearAccessToken();
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';
    const isAuthor = user?.role === 'author';

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isAuthor }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
