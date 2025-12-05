import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 스타일 객체 정의 (styled-components 대체)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 80px)',
    backgroundColor: '#f8f9fa',
  },
  box: {
    width: '450px',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '20px',
    color: '#333',
  },
  description: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '15px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff', // 기본 파란색
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  message: {
    fontSize: '12px',
    marginTop: '-10px',
    marginBottom: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
  }
};

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [isValidToken, setIsValidToken] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 실시간 검증용 상태
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  const isRun = useRef(false);

  // 1. 페이지 로드 시 토큰 검증
  useEffect(() => {
    if (isRun.current) return;
    if (!token) {
      alert("잘못된 접근입니다.");
      navigate('/');
      return;
    }

    const verifyToken = async () => {
      isRun.current = true;
      try {
        const response = await axios.get(`/auth/reset/verify?token=${token}`);
        if (response.status === 200) {
          setIsValidToken(true);
        }
      } catch (error) {
        console.error("토큰 검증 실패:", error);
        alert("유효하지 않거나 만료된 링크입니다.");
        navigate('/');
      }
    };

    verifyToken();
  }, [token, navigate]);

  // 비밀번호 정규식 검사 함수
  const validatePasswordRegex = (password) => {
    // 8자 이상, 영문+숫자+특수문자 포함
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/;
    return regex.test(password);
  };

  // 비밀번호 입력 시 실시간 검사 핸들러
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    if (value.length === 0) {
        setPasswordMessage("");
        setIsPasswordValid(false);
    } else if (!validatePasswordRegex(value)) {
        setPasswordMessage("8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.");
        setIsPasswordValid(false);
    } else {
        setPasswordMessage("✅ 안전한 비밀번호입니다.");
        setIsPasswordValid(true);
    }
  };

  // 2. 비밀번호 변경 요청
  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    // 최종 검사 (안전장치)
    if (!isPasswordValid) {
      alert("비밀번호 조건을 확인해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      await axios.post('/auth/reset/confirm', {
        token: token,
        newPassword: newPassword
      });

      alert("비밀번호가 성공적으로 변경되었습니다.\n새 비밀번호로 로그인해주세요.");
      navigate('/'); 

    } catch (error) {
      console.error("변경 실패:", error);
      alert("비밀번호 변경에 실패했습니다.");
    }
  };

  if (!isValidToken) {
    return <div style={styles.container}>토큰 검증 중...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>새 비밀번호 설정</h2>
        <p style={styles.description}>
          안전한 비밀번호로 변경해 주세요.<br/>
          (8자 이상, 영문/숫자/특수문자 포함)
        </p>

        {/* 새 비밀번호 입력 (실시간 검사 적용) */}
        <input 
          type="password" 
          placeholder="새 비밀번호" 
          value={newPassword}
          onChange={handlePasswordChange}
          style={styles.input}
        />
        {/* 검사 메시지 출력 (동적 스타일 적용) */}
        {passwordMessage && (
          <div style={{ 
            ...styles.message, 
            color: isPasswordValid ? '#28a745' : '#dc3545' 
          }}>
            {passwordMessage}
          </div>
        )}

        <input 
          type="password" 
          placeholder="새 비밀번호 확인" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />
        
        <button onClick={handleReset} style={styles.button}>비밀번호 변경</button>
      </div>
    </div>
  );
}

export default ResetPasswordPage;