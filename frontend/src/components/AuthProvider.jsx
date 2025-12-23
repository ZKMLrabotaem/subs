import { createContext, useState, useEffect, useCallback } from "react";
import * as authApi from "../api/auth";
import {getMe} from "../api/users.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const init = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getMe();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        init();
    }, [init]);

    const login = async (credentials) => {
        const { data } = await authApi.login(credentials);
        setUser(data.user ?? data);
        await init();
        return data;
    };

    const register = async (payload) => {
        const { data } = await authApi.register(payload);
        setUser(data.user ?? data);
        await init();
        return data;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        isAuth: !!user,
        loading,
        login,
        register,
        logout,
        refresh: init
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
