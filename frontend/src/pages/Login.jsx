import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 백엔드 통신용

// 1. 전체 화면을 감싸는 컨테이너 (화면 중앙 정렬)
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 80px); /* 헤더 높이 대략 80px 뺌 */
  background-color: #f8f9fa; /* 아주 연한 회색 배경 */
`;

// 2. 로그인 폼 박스 (흰색 카드)
const LoginBox = styled.div`
  width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
`;

// 3. 입력창 스타일
const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary-blue, #007bff); /* 포커스 되면 파란색 */
  }
`;

// 4. 로그인 버튼 스타일
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
  margin-top: 10px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

// 5. 하단 링크들 (회원가입, 비번찾기)
const FooterLinks = styled.div`
  margin-top: 20px;
  font-size: 13px;
  color: #666;

  a {
    color: #666;
    text-decoration: none;
    margin: 0 10px;
    
    &:hover {
      text-decoration: underline;
      color: var(--primary-blue, #007bff);
    }
  }
`;

function Login() {
  const navigate = useNavigate();
  
  // 입력된 아이디/비번을 저장하는 State
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  // 입력할 때마다 State 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 로그인 버튼 눌렀을 때 실행
  const handleSubmit = async (e) => {
    e.preventDefault(); // 새로고침 방지

    // 1. 유효성 검사 (빈칸 체크)
    if (!formData.id || !formData.password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // 2. 백엔드로 데이터 전송 (나중에 주석 해제해서 쓰세요!)
      /*
      const response = await axios.post('/api/login', {
        username: formData.id,
        password: formData.password
      });

      if (response.status === 200) {
        alert('로그인 성공!');
        navigate('/'); // 메인으로 이동
      }
      */

      // [임시] 백엔드 없을 때 테스트용
      console.log('전송할 데이터:', formData);
      alert(`${formData.id}님 환영합니다! (테스트용)`);
      navigate('/'); // 메인으로 이동

    } catch (error) {
      console.error('로그인 실패:', error);
      alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
  };

  return (
    <Container>
      <LoginBox>
        <Title>로그인</Title>
        <form onSubmit={handleSubmit}>
          <Input 
            type="text" 
            name="id" 
            placeholder="아이디" 
            value={formData.id}
            onChange={handleChange}
          />
          <Input 
            type="password" 
            name="password" 
            placeholder="비밀번호" 
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit">로그인</Button>
        </form>

        <FooterLinks>
          <Link to="/signup">회원가입</Link>
          |
          <Link to="/findpw">비밀번호 찾기</Link>
        </FooterLinks>

      </LoginBox>
    </Container>
  );
}

export default Login;