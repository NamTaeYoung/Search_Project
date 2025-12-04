// src/AboutPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <div>
      <h1>ℹ️ 소개 페이지</h1>
      <p>이 서비스에 대한 간략한 설명입니다.</p>
      {/* 다시 홈 페이지로 돌아가는 버튼 */}
      <Link to="/">
        <button>홈으로 돌아가기</button>
      </Link>
    </div>
  );
}

export default AboutPage;