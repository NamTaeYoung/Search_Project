import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 스타일 객체 정의 (styled-components 대체)
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    width: '400px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    position: 'relative',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box', // padding 포함 크기 계산
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff', // 기본 파란색
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  footer: {
    marginTop: '20px',
    fontSize: '13px',
    color: '#666',
  },
  link: {
    color: '#007bff',
    cursor: 'pointer',
    marginLeft: '5px',
    fontWeight: 'bold',
  }
};

function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.status === 200) {
        console.log("로그인 성공:", response.data);
        
        // 1. 토큰 저장
        const token = response.data.token || response.data; 
        localStorage.setItem('token', token);

        // 2. 유저 정보 저장 (헤더 표시용)
        const fakeUser = {
            email: formData.email,
            fullName: '회원' 
        };
        localStorage.setItem('user', JSON.stringify(fakeUser));

        alert("로그인 성공!");
        onClose();
        window.location.reload(); 
      }

    } catch (error) {
      console.error("로그인 실패:", error);

      // 에러 처리 로직
      if (error.response) {
        const status = error.response.status;
        const msg = error.response.data;

        // 1. 이메일 미인증 (403)
        if (status === 403 && typeof msg === 'string' && msg.includes('이메일 인증')) {
            if (window.confirm(`${msg}\n\n지금 인증 코드를 입력하시겠습니까?`)) {
                onClose();
                navigate(`/verify-email?email=${formData.email}`);
            }
            return;
        }

        // 2. 비밀번호 틀림 (401)
        if (status === 401) {
            alert("아이디 또는 비밀번호가 일치하지 않습니다.");
            return;
        }
        
        // 3. 그 외 에러
        alert(msg);
      } else {
        alert("서버와 연결할 수 없습니다.");
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.content}>
        <button style={styles.closeBtn} onClick={onClose}>X</button>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>로그인</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email" 
            placeholder="이메일"
            value={formData.email} 
            onChange={handleChange}
            style={styles.input}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="비밀번호"
            value={formData.password} 
            onChange={handleChange}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>로그인</button>
        </form>
        <div style={styles.footer}>
            계정이 없으신가요? 
            <span 
              style={styles.link}
              onClick={() => { onClose(); navigate('/signup'); }}
            >
              회원가입
            </span>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;