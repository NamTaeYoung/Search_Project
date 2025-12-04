// src/components/common/Footer.jsx
import React from 'react';
import styled from 'styled-components';

const StyledFooter = styled.footer`
  padding: 20px 30px;
  background-color: #f0f2f5;
  border-top: 1px solid var(--border-light);
  color: var(--text-light);
  font-size: 13px;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

function Footer() {
  return (
    <StyledFooter>
      <div>© 2025 K-Stock Insight</div>
      <div>주식 뉴스 기반 감성 키워드 검색엔진</div>
    </StyledFooter>
  );
}

export default Footer;