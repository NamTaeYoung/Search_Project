// src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* CSS 변수를 사용하여 공통 색상 정의 */
  :root {
    --primary-blue: #1a73e8;
    --light-blue: #e8f0fe;
    --dark-blue: #0f4c81;
    --text-dark: #333;
    --text-light: #666;
    --border-light: #eee;
    --bg-light: #f7f9fc;
    --red-up: #ef5350;
    --blue-down: #2196f3;
  }

  /* 모든 요소에 적용될 기본 스타일 */
  body {
    margin: 0;
    padding: 0;
    width: 100%; /* ⬅️ 추가: 헤더가 꽉 차도록 body 너비 100% 설정 */
    font-family: 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
    background-color: var(--bg-light);
    color: var(--text-dark);
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    width: 100%; /* ⬅️ 추가: #root 너비 100% 설정 */
  }

  a {
    color: var(--primary-blue);
    text-decoration: none;
  }

  button {
    background-color: var(--primary-blue);
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
  }

  /* 공통으로 사용될 카드 스타일 */
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 20px;
  }
`;

export default GlobalStyles;