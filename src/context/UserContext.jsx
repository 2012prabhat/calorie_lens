"use client";
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            setUser(null);
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        // Axios interceptor for handling token expiration (401)
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    setUser(null);
                    const path = window.location.pathname;
                    const isPublicPath = path === '/' || path === '/login' || path === '/signup' || path === '/verifyemail' || path === '/forgotpassword' || path === '/resetpassword';
                    
                    if (!isPublicPath) {
                        window.location.href = "/login";
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
