"use client";
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/auth/me');
                if (response.data.data) {
                    setUser(response.data.data);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        // Cleanup interceptor
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};
