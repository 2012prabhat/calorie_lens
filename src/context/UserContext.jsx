"use client";
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize Authorization header from localStorage on client side
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedToken = localStorage.getItem("auth_token");
            if (savedToken) {
                axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
            }
        }
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/auth/me');
            if (response.data && response.data.data) {
                setUser(response.data.data);
                return response.data.data;
            }
            return null;
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await axios.get('/api/auth/logout');
        } catch (err) {
            console.error("Logout request error:", err);
        } finally {
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
                delete axios.defaults.headers.common["Authorization"];
            }
            setUser(null);
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        // Axios interceptor for handling 401 without forcefully redirecting user during active tasks
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    // Only reset user if the failure was specifically from the /api/auth/me endpoint
                    if (error.config?.url?.includes('/api/auth/me')) {
                        setUser(null);
                        if (typeof window !== "undefined") {
                            localStorage.removeItem("auth_token");
                            delete axios.defaults.headers.common["Authorization"];
                        }
                    }
                }
                return Promise.reject(error);
            }
        );

        fetchUser();

        // Cleanup interceptor
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, setUser, loading, refreshUser: fetchUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};
