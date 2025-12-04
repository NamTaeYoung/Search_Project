import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ... (스타일 컴포넌트들은 기존 그대로 유지하세요) ...
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

function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '' 
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email') {
      setIsEmailChecked(false);
    }
  };

  // 🔎 이메일 중복 확인 (수정됨)
  const handleCheckEmail = async () => {
    if (!formData.email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    
    try {
      // ⭐ [핵심 수정 1] JSON이 아니라 '파라미터(?email=...)' 형식으로 보냄
      // 백엔드 Controller가 @RequestParam을 쓰기 때문입니다.
      const response = await axios.post('/auth/check-email', null, {
        params: { email: formData.email }
      });

      // ⭐ [핵심 수정 2] 백엔드가 true/false를 보내주므로 그걸 확인
      if (response.data === true) {
        alert("✅ 사용 가능한 이메일입니다.");
        setIsEmailChecked(true); 
      } else {
        alert("❌ 이미 사용 중인 이메일입니다.");
        setIsEmailChecked(false);
      }

    } catch (error) {
      console.error("중복 체크 에러:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setIsEmailChecked(false);
    }
  };

  // 회원가입 요청 (수정됨)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailChecked) {
      alert("이메일 중복 확인을 해주세요!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }

    // ⭐ [핵심 수정 3] 한국 이름 쪼개기 (백엔드가 firstName, lastName을 원함)
    // 예: "홍길동" -> lastName="홍", firstName="길동"
    const name = formData.name.trim();
    const lastName = name.substring(0, 1);
    const firstName = name.substring(1);

    try {
      await axios.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: firstName, // 쪼갠 이름 전송
        lastName: lastName,   // 쪼갠 성 전송
        // fullName은 백엔드에서 합쳐서 만든다고 되어있으므로 안 보내도 됨 (보내도 무시될 듯)
        provider: 'LOCAL'
      });
      
      alert('가입 성공! 이메일로 전송된 인증 코드를 확인해주세요.');
      navigate(`/verify-email?email=${formData.email}`); 

    } catch (error) {
      console.error('가입 에러:', error);
      alert('회원가입에 실패했습니다.');
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
            {isEmailChecked && <span style={{color: 'green', fontSize: '12px', marginTop: '5px', display: 'block'}}>✅ 사용 가능합니다.</span>}
          </InputGroup>

          <InputGroup>
            <label>비밀번호</label>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호" />
          </InputGroup>

          <InputGroup>
            <label>비밀번호 확인</label>
            <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="비밀번호 확인" />
          </InputGroup>

          <InputGroup>
            <label>이름</label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="실명 입력" />
          </InputGroup>

          <Button type="submit" disabled={!isEmailChecked}>가입하기</Button>
        </form>
      </SignupBox>
    </Container>
  );
}
export default Signup;