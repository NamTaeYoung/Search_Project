import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- 스타일 컴포넌트 ---
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 80px);
  background-color: #f8f9fa;
`;

const SignupBox = styled.div`
  width: 480px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 30px;
  color: #333;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
  text-align: left;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
    color: #666;
  }
`;

const EmailRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box; 
  &:focus { border-color: var(--primary-blue, #007bff); }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-blue, #007bff);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  &:hover { background-color: #0056b3; }
  &:disabled { background-color: #ccc; cursor: not-allowed; }
`;

const CheckButton = styled.button`
  width: 100px;
  padding: 0;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  &:hover { background-color: #5a6268; }
`;

// 메시지 스타일 (성공: 초록, 실패: 빨강)
const Message = styled.span`
  font-size: 12px;
  margin-top: 5px;
  display: block;
  color: ${props => props.isValid ? '#28a745' : '#dc3545'};
  font-weight: bold;
`;

// 하단 링크 영역
const Footer = styled.div`
  margin-top: 30px;
  font-size: 13px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LinkText = styled.span`
  color: #007bff;
  cursor: pointer;
  margin-left: 5px;
  font-weight: bold;
`;

function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '' 
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  
  // 이메일 메시지 상태
  const [emailMessage, setEmailMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  // ⭐ [추가] 비밀번호 메시지 상태
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // 로그인 상태 체크
  useEffect(() => {
    if (localStorage.getItem('token')) {
      alert("이미 로그인이 되어있습니다.");
      navigate('/');
    }
  }, [navigate]);

  // 비밀번호 정규식 검사 함수
  const validatePasswordRegex = (password) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 1. 이메일 수정 시 중복확인 초기화
    if (name === 'email') {
      setIsEmailChecked(false);
      setEmailMessage(''); 
    }

    // ⭐ 2. 비밀번호 입력 시 실시간 검사
    if (name === 'password') {
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
    }
  };

  const handleCheckEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailMessage("올바른 이메일 형식이 아닙니다.");
      setIsEmailValid(false);
      return;
    }
    
    try {
      const response = await axios.post('/auth/check-email', null, {
        params: { email: formData.email }
      });

      if (response.data === true) {
        setEmailMessage("✅ 사용 가능한 이메일입니다.");
        setIsEmailValid(true);
        setIsEmailChecked(true); 
      } else {
        setEmailMessage("❌ 이미 사용 중인 이메일입니다.");
        setIsEmailValid(false);
        setIsEmailChecked(false);
      }

    } catch (error) {
      console.error("중복 체크 에러:", error);
      setEmailMessage("❌ 오류가 발생했습니다.");
      setIsEmailValid(false);
      setIsEmailChecked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.name) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    if (!isEmailChecked) {
      alert("이메일 중복 확인을 해주세요!");
      return;
    }

    // ⭐ 제출 전 한 번 더 확인 (안전장치)
    if (!isPasswordValid) {
      alert("비밀번호 조건을 확인해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }

    const name = formData.name.trim();
    const lastName = name.substring(0, 1);
    const firstName = name.substring(1);

    try {
      await axios.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName,
        provider: 'LOCAL'
      });
      
      alert('회원가입이 완료되었습니다!\n가입하신 이메일로 인증 링크가 발송되었습니다.\n메일함에서 인증을 완료한 후 로그인해주세요.');
      navigate('/'); 

    } catch (error) {
      console.error('가입 에러:', error);
      if (error.response && error.response.data) {
         alert(error.response.data);
      } else {
         alert('회원가입에 실패했습니다.');
      }
    }
  };

  return (
    <Container>
      <SignupBox>
        <Title>회원가입</Title>
        <form onSubmit={handleSubmit}>
          
          <InputGroup>
            <label>이메일</label>
            <EmailRow>
              <Input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="example@email.com" 
              />
              <CheckButton type="button" onClick={handleCheckEmail}>중복 확인</CheckButton>
            </EmailRow>
            {emailMessage && <Message isValid={isEmailValid}>{emailMessage}</Message>}
          </InputGroup>

          <InputGroup>
            <label>비밀번호</label>
            <Input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="8자 이상, 영문/숫자/특수문자 포함" 
            />
            {/* ⭐ 비밀번호 메시지 표시 */}
            {passwordMessage && <Message isValid={isPasswordValid}>{passwordMessage}</Message>}
          </InputGroup>

          <InputGroup>
            <label>비밀번호 확인</label>
            <Input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="비밀번호 확인" 
            />
          </InputGroup>

          <InputGroup>
            <label>이름</label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="실명 입력" />
          </InputGroup>

          <Button type="submit" disabled={!isEmailChecked}>가입하기</Button>
        </form>

        <Footer>
            <div>
                이미 계정이 있으신가요? 
                <LinkText onClick={() => navigate('/')}>
                  로그인 하러가기
                </LinkText>
            </div>
            <div>
                비밀번호를 잊으셨나요?
                <LinkText onClick={() => navigate('/find-pw')}>
                  비밀번호 찾기
                </LinkText>
            </div>
        </Footer>

      </SignupBox>
    </Container>
  );
}
export default Signup;