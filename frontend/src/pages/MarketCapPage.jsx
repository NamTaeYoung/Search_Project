// src/pages/MarketCapPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// -----------------------------------------------------
// 1. 데이터 포맷팅 유틸리티 (개선)
// -----------------------------------------------------

/** 등락률을 포맷합니다. (예: 1.49 -> +1.49%) */
const formatChangeRate = (rate) => {
    if (rate === undefined || rate === null || rate === "") return '-';
    
    const numericRate = Number(rate); 
    
    if (isNaN(numericRate)) return '-';
    
    const sign = numericRate > 0 ? '+' : (numericRate < 0 ? '' : '');
    return `${sign}${numericRate.toFixed(2)}%`; 
};

/** 등락률에 따른 CSS 클래스를 반환합니다. */
const getChangeRateClass = (rate) => {
    if (rate > 0) return 'up';
    if (rate < 0) return 'down';
    return 'even';
};

/** 🌟 시가총액 문자열을 보기 좋게 포맷합니다. (예: 490조 -> 490조) */
const formatMarketCap = (capString) => {
    if (!capString) return '-';
    
    // 백엔드에서 '490조', '1,000억' 형태로 넘어온다고 가정하고 처리합니다.
    return capString.trim();
};


// -----------------------------------------------------
// 2. Styled Components 정의 (변화 없음)
// -----------------------------------------------------

const MarketCapContainer = styled.div`
    padding: 20px 0;
    max-width: 1200px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 25px;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 10px;
`;

const TableCard = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    padding: 0;
    overflow: hidden; 
`;

const RankingTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    
    th, td {
        padding: 12px 15px;
        text-align: right;
        border-bottom: 1px solid var(--border-light);
        font-size: 14px;
    }
    
    th {
        background-color: var(--bg-light);
        font-weight: 600;
        color: var(--text-dark);
        text-align: center;
    }
    
    td:first-child, td:nth-child(2) {
        text-align: center;
    }

    .change-rate {
        font-weight: 600;
        /* var(--red-up)과 var(--blue-down)는 전역 CSS 변수로 정의되어 있어야 합니다. */
        color: var(--text-dark); 

        &.up {
            color: var(--red-up, #ef4444); /* 기본값 지정 */
        }
        &.down {
            color: var(--blue-down, #3b82f6); /* 기본값 지정 */
        }
    }
`;

// -----------------------------------------------------
// 3. MarketCapPage 컴포넌트 정의
// -----------------------------------------------------

function MarketCapPage() {
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRankingData = async () => {
            try {
                setLoading(true);
                setError(null);
                // 🚨 MyBatis를 사용하는 Spring Boot API 호출 경로
                const response = await axios.get('http://localhost:8484/api/stocks/marketcap');
                
                // DTO 배열을 받아와서 상태에 저장
                setRankingData(response.data);
            } catch (err) {
                console.error("시총 데이터 로드 실패:", err);
                setError("데이터 로드에 실패했습니다. 백엔드 서버 상태와 CORS 설정을 확인해주세요.");
                setRankingData([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchRankingData();
    }, []);

    return (
        <MarketCapContainer>
            <Title>시가총액 순위 TOP 100</Title>
            <p className="text-gray">Oracle DB의 STOCK_INFO 테이블에서 가져온 실시간 시가총액 순위를 보여줍니다.</p>

            <TableCard>
                {loading ? (
                    <p style={{textAlign: 'center', padding: '20px'}}>데이터를 불러오는 중...</p>
                ) : error ? (
                    <p style={{color: 'red', fontWeight: 'bold', padding: '20px'}}>{error}</p>
                ) : (
                    <RankingTable>
                        <thead>
                            <tr>
                                <th>순위</th>
                                <th>종목명</th>
                                <th>업종</th>
                                <th>현재가</th>
                                <th>전일 대비</th>
                                <th>등락률</th>
                                <th>시가총액</th>
                                <th>업데이트</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankingData.map((item, index) => {
                                // CHANGE_RATE는 Double 타입, PRICE_CHANGE는 Long 타입이라고 가정
                                const rateString = formatChangeRate(item.changeRate);
                                const rateClass = getChangeRateClass(item.changeRate); 
                                
                                // 값이 null/undefined일 경우 '-'로 표시
                                const formattedPrice = item.price?.toLocaleString() || '-';
                                const formattedChange = item.priceChange?.toLocaleString() || '-';
                                const formattedMarketCap = formatMarketCap(item.marketCap);

                                return (
                                    <tr key={item.stockCode || index}> {/* key는 stockCode가 없을 경우 index 사용 */}
                                        <td>{index + 1}</td> {/* 백엔드에서 순서대로 넘겨주므로 index+1이 순위 */}
                                        <td>{item.stockName || '-'}</td>
                                        <td>{item.industry || 'ETF'}</td>
                                        
                                        {/* 현재가 */}
                                        <td>{formattedPrice !== '-' ? formattedPrice + '원' : '-'}</td> 
                                        
                                        {/* 전일 대비: 색상 클래스 적용 */}
                                        <td className={`change-rate ${rateClass}`}>
                                            {formattedChange !== '-' ? formattedChange + '원' : '-'} 
                                        </td>
                                        
                                        {/* 등락률: 포맷팅된 문자열 사용 */}
                                        <td className={`change-rate ${rateClass}`}>
                                            {rateString}
                                        </td>
                                        
                                        {/* 시가총액: 문자열 포맷팅 */}
                                        <td>{formattedMarketCap}</td>
                                        
                                        <td>
                                            {/* Date 객체 포맷팅 */}
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </RankingTable>
                )}
            </TableCard>
        </MarketCapContainer>
    );
}

export default MarketCapPage;