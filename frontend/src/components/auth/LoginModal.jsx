import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ==========================================
// 1. 스타일 컴포넌트 정의 (디자인 영역 - 전체 포함)
// ==========================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  position: relative;
  text-align: center;
  /* 내용이 넘칠 경우를 대비 */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-blue, #007bff);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  &:hover {
    background-color: #0056b3;
  }
`;

const Divider = styled.div`
  margin: 25px 0;
  position: relative;
  border-top: 1px solid #eee;
  width: 100%;
  
  span {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    padding: 0 10px;
    color: #999;
    font-size: 12px;
  }
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &.kakao { background-color: #FEE500; color: #000; }
  &.naver { background-color: #03C75A; color: #fff; }
  &.google { background-color: #fff; color: #000; border: 1px solid #ddd; }
  &.qr { background-color: #333; color: #fff; }
  
  &:hover { opacity: 0.9; }
`;

// 하단 링크 영역 스타일 (세로 배치)
const Footer = styled.div`
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  align-items: center;
`;

const FooterRow = styled.div`
  font-size: 13px;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const LinkText = styled.span`
  color: #007bff;
  cursor: pointer;
  font-weight: bold;
`;

// QR 화면 전용 스타일 (세로 배치 강제)
const QrContainer = styled.div`
  display: flex;
  flex-direction: column !important;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 10px 0;
  width: 100%;

  img {
    width: 180px;
    height: 180px;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 8px;
    display: block;
  }
  
  p {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin: 0;
    width: 100%;
    text-align: center;
    white-space: normal;
  }

  .timer {
    color: #d60000;
    font-weight: bold;
    font-size: 14px;
    margin: 5px 0;
  }
`;

// ==========================================
// 2. 컴포넌트 로직 정의 (기능 영역)
// ==========================================

function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  // QR 관련 State
  const [isQrMode, setIsQrMode] = useState(false);
  const [qrSessionId, setQrSessionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5분
  
  const pollingRef = useRef(null);

  // ----------------------------------------
  // [공통] 로그인 성공 시 처리 함수
  // ----------------------------------------
  const handleLoginSuccess = (data) => {
    const { accessToken, refreshToken, token } = data;
    const user = data.user || data.userInfo;

    localStorage.setItem('accessToken', accessToken || token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    const userInfo = user || { email: "QR로그인", fullName: '회원' };
    localStorage.setItem('user', JSON.stringify(userInfo));

    alert("로그인 성공!");
    onClose();
    window.location.reload(); 
  };

  // ----------------------------------------
  // [QR] 세션 생성, 타이머, 폴링
  // ----------------------------------------

  // 모드 변경 감지
  useEffect(() => {
    if (isQrMode) {
      createQrSession();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isQrMode]);

  // 타이머 작동
  useEffect(() => {
    let timer;
    if (isQrMode && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
        stopPolling();
        alert("시간이 만료되었습니다. 다시 시도해주세요.");
        setIsQrMode(false);
    }
    return () => clearInterval(timer);
  }, [isQrMode, timeLeft]);

  // 1. QR 세션 생성 요청
  const createQrSession = async () => {
    try {
      const response = await axios.get('/auth/qr/create');
      const { sessionId } = response.data;
      
      setQrSessionId(sessionId);
      setTimeLeft(300);
      startPolling(sessionId); // 생성 직후 감시 시작

    } catch (error) {
      console.error("QR 생성 실패:", error);
      alert("QR 코드 생성에 실패했습니다. (백엔드 서버 확인 필요)");
      setIsQrMode(false);
    }
  };

  // 2. 상태 확인 (Polling) - /auth/qr/check 사용
  const startPolling = (sessionId) => {
    stopPolling(); 
    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/auth/qr/check?sessionId=${sessionId}`);
        const status = res.data.status; 

        if (status === 'APPROVED') {
            stopPolling(); 
            performQrLogin(sessionId); 
        } else if (status === 'EXPIRED') {
            stopPolling();
            alert("QR 코드가 만료되었습니다.");
            setIsQrMode(false);
        }
      } catch (error) {
         console.log("폴링 중 대기...");
      }
    }, 2000); 
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // 3. 최종 로그인 요청 (JWT 발급)
  const performQrLogin = async (sessionId) => {
    try {
        const response = await axios.post('/auth/qr/login', { sessionId });
        handleLoginSuccess(response.data);
    } catch (error) {
        alert("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  // ----------------------------------------
  // [기존] 이메일 로그인
  // ----------------------------------------
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
        handleLoginSuccess(response.data);
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      if (error.response) {
        const { status, data } = error.response;
        
        // 403: 이메일 미인증
        if (status === 403 && typeof data === 'string' && data.includes('이메일 인증')) {
            if (window.confirm(`${data}\n\n지금 인증 코드를 입력하시겠습니까?`)) {
                onClose();
                navigate(`/verify-email?email=${formData.email}`);
            }
            return;
        }
        // 401: 비밀번호 불일치
        if (status === 401) {
            alert("아이디 또는 비밀번호가 일치하지 않습니다.");
            return;
        }
        alert(typeof data === 'string' ? data : "로그인에 실패했습니다.");
      } else {
        alert("서버와 연결할 수 없습니다.");
      }
    }
  };

  // ----------------------------------------
  // [기존] 소셜 로그인 핸들러
  // ----------------------------------------
  const handleSocialLogin = (provider) => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const REDIRECT_URI_ROOT = "http://localhost:5173/oauth/callback";

    let url = "";
    if (provider === 'kakao') {
      const redirectUri = `${REDIRECT_URI_ROOT}/kakao`;
      url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
    } else if (provider === 'naver') {
      const redirectUri = `${REDIRECT_URI_ROOT}/naver`;
      const state = Math.random().toString(36).substring(7); 
      url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;
    } else if (provider === 'google') {
      const redirectUri = `${REDIRECT_URI_ROOT}/google`;
      url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    }
    if (url) window.location.href = url;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ==========================================
  // 3. 화면 렌더링 (View)
  // ==========================================
  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <CloseButton onClick={onClose}>X</CloseButton>
        <Title>{isQrMode ? "QR코드 로그인" : "로그인"}</Title>
        
        {isQrMode ? (
            // === QR 모드 화면 ===
            <QrContainer>
                {qrSessionId ? (
                    <img 
                        src={`/auth/qr/image?sessionId=${qrSessionId}`} 
                        alt="QR Code" 
                        onError={(e) => {
                             e.target.onerror = null; 
                             e.target.src="https://via.placeholder.com/200?text=QR+Loading+Error";
                        }}
                    />
                ) : (
                    <div style={{height: '180px', display: 'flex', alignItems: 'center'}}>
                        QR 생성 중...
                    </div>
                )}
                
                <p>
                    모바일 앱의 카메라로<br/>
                    QR 코드를 스캔해주세요.
                </p>
                
                <div className="timer">남은 시간: {formatTime(timeLeft)}</div>
                
                <Button 
                    style={{ backgroundColor: '#6c757d', marginTop: '10px' }} 
                    onClick={() => setIsQrMode(false)}
                >
                    이메일로 로그인하기
                </Button>
            </QrContainer>
        ) : (
            // === 일반 로그인 화면 ===
            <>
                <form onSubmit={handleSubmit}>
                  <Input type="email" name="email" placeholder="이메일" value={formData.email} onChange={handleChange} />
                  <Input type="password" name="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} />
                  <Button type="submit">로그인</Button>
                </form>

                <div style={{ marginTop: '10px', width: '100%' }}>
                    <SocialButton className="qr" onClick={() => setIsQrMode(true)}>
                         📷 QR 코드로 로그인
                    </SocialButton>
                </div>

                <Divider><span>또는</span></Divider>
                
                <SocialButton className="kakao" onClick={() => handleSocialLogin('kakao')}>
                   카카오로 시작하기
                </SocialButton>
                <SocialButton className="naver" onClick={() => handleSocialLogin('naver')}>
                   네이버로 시작하기
                </SocialButton>
                <SocialButton className="google" onClick={() => handleSocialLogin('google')}>
                   구글로 시작하기
                </SocialButton>

                <Footer>
                    <FooterRow>
                        <span>계정이 없으신가요?</span>
                        <LinkText onClick={() => { onClose(); navigate('/signup'); }}>
                          회원가입
                        </LinkText>
                    </FooterRow>
                    <FooterRow>
                        <span>비밀번호를 잊으셨나요?</span>
                        <LinkText onClick={() => { onClose(); navigate('/find-pw'); }}>
                          비밀번호 찾기
                        </LinkText>
                    </FooterRow>
                </Footer>
            </>
        )}

      </ModalContent>
    </ModalOverlay>
  );
}

export default LoginModal;