// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // npm install axios 필요

const AuthContext = createContext();

// 임시 토큰 키
const AUTH_TOKEN_KEY = 'authToken';

export const AuthProvider = ({ children }) => {
    // 🚨 실제 구현에서는 토큰 확인 API 호출을 useEffect 내에서 처리해야 합니다.
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem(AUTH_TOKEN_KEY)); // 로컬 저장소 기반 초기 상태
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // 임시로 로딩 상태 비활성화

    // 🚨 임시 로그인 함수: 토큰이 저장되었다고 가정하고 상태 변경
    const login = (token, userData) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        setIsLoggedIn(true);
        setUser(userData || { name: '테스트 사용자' }); 
        alert("로그인 처리됨 (토큰 저장됨)");
    };

    // 🚨 로그아웃 함수: 토큰을 제거하고 상태 변경
    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setIsLoggedIn(false);
        setUser(null);
        alert("로그아웃 처리됨 (토큰 삭제됨)");
    };

    // 🚨 실제 API 연동 시, 여기에 useEffect를 사용하여 서버 상태 확인 로직을 추가해야 합니다.

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook 생성
export const useAuth = () => useContext(AuthContext);