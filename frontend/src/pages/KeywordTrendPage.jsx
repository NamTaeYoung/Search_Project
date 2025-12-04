// src/pages/KeywordTrendPage.jsx (수정된 코드)

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // axios 임포트

// -----------------------------------------------------
// 1. Styled Components 정의 (이전 코드에서 재사용)
// -----------------------------------------------------

const TrendContainer = styled.div`
    padding: 20px 0;
    max-width: 1000px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 25px;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 10px;
`;

const TrendGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const KeywordItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    
    .rank {
        font-weight: bold;
        color: var(--primary-blue);
        margin-right: 15px;
        min-width: 30px;
    }
    .name {
        font-weight: 500;
        margin-right: 10px;
    }
`;

const ScoreBarContainer = styled.div`
    flex: 1;
    background-color: var(--border-light);
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
`;

const ScoreBar = styled.div`
    height: 100%;
    width: ${props => props.score}%;
    background-color: var(--primary-blue);
`;

const RelatedNews = styled.div`
    /* 관련 종목/뉴스 영역 스타일 */
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

// -----------------------------------------------------
// 2. KeywordTrendPage 컴포넌트 정의
// -----------------------------------------------------

function KeywordTrendPage() {
    // 트렌드 데이터를 저장할 상태
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🚨 컴포넌트 마운트 시 API 호출
    useEffect(() => {
        const fetchTrends = async () => {
            try {
                // 🚨 스프링 부트 서버의 포트(8484)와 엔드포인트에 맞춥니다.
                const response = await axios.get('http://localhost:8484/api/trends');
                setTrends(response.data);
                setError(null);
            } catch (err) {
                console.error("트렌드 데이터 로드 실패:", err);
                setError("데이터 로드에 실패했습니다. 스프링 부트 서버를 확인해주세요.");
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때만 실행

    return (
        <TrendContainer>
            <Title>키워드 트렌드</Title>
            <p className="text-gray">최근 뉴스에서 많이 언급되는 키워드를 통해 시장 이슈를 파악할 수 있습니다.</p>
            
            {loading && <p>데이터를 불러오는 중...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            
            <TrendGrid>
                {/* ----------------- 좌측: 키워드 TOP 20 ----------------- */}
                <div>
                    <h2>키워드 TOP 20</h2>
                    <div>
                        {trends.map((item, index) => (
                            <KeywordItem key={index}>
                                <span className="rank">{item.rank}위</span>
                                <span className="name">{item.keyword}</span>
                                <ScoreBarContainer>
                                    <ScoreBar score={item.score} />
                                </ScoreBarContainer>
                                <span style={{marginLeft: '10px', color: 'var(--text-light)'}}>{item.score}</span>
                            </KeywordItem>
                        ))}
                    </div>
                </div>

                {/* ----------------- 우측: 선택된 키워드 관련 정보 ----------------- */}
                <RelatedNews>
                    <h2>선택한 키워드 관련 종목/뉴스</h2>
                    <p className="text-gray">키워드를 클릭하면 관련 종목과 뉴스를 표시합니다.</p>
                    {/* 여기에 NewsCard 등을 사용하여 관련 뉴스 목록을 표시할 수 있습니다. */}
                </RelatedNews>
            </TrendGrid>
        </TrendContainer>
    );
}

export default KeywordTrendPage;