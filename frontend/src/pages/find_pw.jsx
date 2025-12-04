import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 백엔드 통신용

function find_pw() {

    return (
        <h1>비밀번호 찾기 페이지입니다.</h1>
    );
}

export default find_pw;