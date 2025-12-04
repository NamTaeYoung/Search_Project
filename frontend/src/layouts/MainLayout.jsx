// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

// 🔴 경로: 상위 폴더(src)로 가서 components/common으로 접근
import Header from '../components/common/Header'; 
import Footer from '../components/common/Footer'; 

const ContentWrapper = styled.div`
  flex: 1; 
  padding: 20px;
  max-width: 1200px; 
  margin: 0 auto; 
  width: 100%; 
`;

function MainLayout() {
  return (
    <>
      <Header />
      <ContentWrapper>
        <Outlet /> 
      </ContentWrapper>
      <Footer />
    </>
  );
}

export default MainLayout;