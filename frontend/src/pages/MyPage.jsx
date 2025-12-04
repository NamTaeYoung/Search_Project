// src/pages/MyPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // 🚨 로그인 상태 Hook 임포트 필요

// -----------------------------------------------------
// 1. Styled Components 정의
// -----------------------------------------------------

const MyPageContainer = styled.div`
    padding: 20px 0;
    max-width: 600px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 25px;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 10px;
`;

const FormCard = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    padding: 30px;
    margin-bottom: 30px;
`;

const InputGroup = styled.div`
    margin-bottom: 20px;
    label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: var(--text-dark);
    }
    input {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-light);
        border-radius: 5px;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
`;

const DangerButton = styled.button`
    background-color: #dc3545;
    &:hover {
        background-color: #c82333;
    }
`;


// -----------------------------------------------------
// 2. MyPage 컴포넌트 정의
// -----------------------------------------------------

function MyPage() {
    // 🚨 useAuth Hook이 없거나 import되지 않았다면 이 부분에서 오류 발생 가능성이 높습니다.
    // const { user, logout } = useAuth(); 
    
    // 임시 사용자 데이터
    const [formData, setFormData] = useState({
        username: 'korea_user',
        email: 'user@kstock.com',
        // password는 보안상 가져오지 않습니다.
    });
    
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        // 🚨 스프링 부트 API 호출
        // try {
        //     await axios.put('http://localhost:8484/api/user/update', formData);
        //     alert('정보가 성공적으로 수정되었습니다.');
        //     setIsEditing(false);
        // } catch (error) {
        //     alert('정보 수정에 실패했습니다.');
        // }
        alert('정보 수정 API 호출 (더미): ' + JSON.stringify(formData));
        setIsEditing(false);
    };

    const handleWithdrawal = () => {
        if (window.confirm("정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            // 🚨 스프링 부트 API 호출
            // axios.delete('http://localhost:8484/api/user/withdraw').then(logout);
            alert('회원 탈퇴 API 호출 (더미): 로그아웃 처리');
            // logout(); // useAuth의 logout 함수 호출
        }
    };

    return (
        <MyPageContainer>
            <Title>내 정보 확인 및 수정</Title>
            
            <FormCard>
                <h2>사용자 정보</h2>
                
                <InputGroup>
                    <label>아이디 (Username)</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </InputGroup>

                <InputGroup>
                    <label>이메일</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </InputGroup>
                
                <ButtonGroup>
                    {isEditing ? (
                        <>
                            <button onClick={handleUpdate}>저장</button>
                            <button onClick={() => setIsEditing(false)} style={{backgroundColor: '#6c757d'}}>취소</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)}>정보 수정</button>
                    )}
                </ButtonGroup>
            </FormCard>
            
            <FormCard style={{borderColor: '#dc3545', borderLeft: '5px solid #dc3545'}}>
                <h2>회원 탈퇴</h2>
                <p className="text-gray">더 이상 서비스를 이용하지 않으려면 회원 탈퇴를 진행할 수 있습니다. 탈퇴 후 모든 정보는 삭제됩니다.</p>
                <ButtonGroup>
                    <DangerButton onClick={handleWithdrawal}>회원 탈퇴</DangerButton>
                </ButtonGroup>
            </FormCard>

        </MyPageContainer>
    );
}

export default MyPage;