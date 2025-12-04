// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // API 호출 라이브러리

// -----------------------------------------------------
// 1. Styled Components 정의
// -----------------------------------------------------

const DashboardContainer = styled.div`
    padding: 20px 0;
    max-width: 1000px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 25px;
`;

const FilterBar = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    
    select {
        padding: 5px 10px;
        border: 1px solid var(--border-light);
        border-radius: 5px;
    }
`;

const ChartPlaceholder = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    padding: 20px;
    min-height: 250px;
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--text-light);
    font-size: 16px;
`;

const TableCard = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    padding: 20px;
`;

const SentimentTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    
    th, td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid var(--border-light);
        font-size: 14px;
    }
    th {
        background-color: var(--bg-light);
        font-weight: 600;
        color: var(--text-dark);
    }
    
    .ratio-bar-cell {
        width: 30%;
    }
`;

const RatioBarContainer = styled.div`
    background-color: var(--bg-light);
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    width: 100%;
`;

const PositiveRatioBar = styled.div`
    height: 100%;
    width: ${props => props.percent}%;
    background-color: var(--red-up);
`;

// -----------------------------------------------------
// 2. DashboardPage 컴포넌트 정의
// -----------------------------------------------------

function DashboardPage() {
    const [sentimentData, setSentimentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30일');

    // API 호출 로직 (useEffect)
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // 🚨 스프링 부트 API 포트와 경로
                const response = await axios.get('http://localhost:8484/api/sentiment/dashboard');
                setSentimentData(response.data);
            } catch (err) {
                console.error("대시보드 데이터 로드 실패:", err);
                // 실패 시 임시 데이터라도 표시할 수 있도록
                setSentimentData([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [period]); // period가 바뀔 때마다 다시 로드 (실제로는 API에 period를 전달해야 함)

    return (
        <DashboardContainer>
            <Title>감성 분석 대시보드</Title>
            <p className="text-gray">주요 코스피 종목들의 뉴스 감성(긍정/부정) 변화를 한 눈에 확인할 수 있습니다.</p>

            <FilterBar>
                기간
                <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option value="30일">최근 30일</option>
                    <option value="7일">최근 7일</option>
                    <option value="90일">최근 90일</option>
                </select>
            </FilterBar>

            {/* 종목별 감성 비율 - 차트 영역 */}
            <h2>종목별 감성 비율</h2>
            <ChartPlaceholder>
                {/* 🚨 실제 구현 시 react-chartjs-2, recharts 등으로 대체해야 합니다. */}
                막대 그래프 / 도넛 차트 영역
            </ChartPlaceholder>

            {/* 종목별 상세 데이터 - 테이블 영역 */}
            <h2>종목별 상세 데이터</h2>
            <TableCard>
                {loading ? (
                    <p>데이터를 불러오는 중...</p>
                ) : (
                    <SentimentTable>
                        <thead>
                            <tr>
                                <th>종목명</th>
                                <th>긍정 비율</th>
                                <th>부정 비율</th>
                                <th style={{textAlign: 'center'}}>기사 수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sentimentData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.stockName}</td>
                                    <td className="ratio-bar-cell">
                                        <RatioBarContainer>
                                            <PositiveRatioBar percent={item.positiveRatio} />
                                        </RatioBarContainer>
                                    </td>
                                    <td className="ratio-bar-cell">
                                        <RatioBarContainer>
                                            {/* 부정 비율은 100%에서 긍정 비율을 뺀 나머지를 색상으로 채웁니다. */}
                                            <div style={{width: `${item.negativeRatio}%`, backgroundColor: 'var(--blue-down)', height: '100%', borderRadius: '4px'}} />
                                        </RatioBarContainer>
                                    </td>
                                    <td style={{textAlign: 'center'}}>{item.articleCount}건</td>
                                </tr>
                            ))}
                        </tbody>
                    </SentimentTable>
                )}
            </TableCard>

        </DashboardContainer>
    );
}

export default DashboardPage;