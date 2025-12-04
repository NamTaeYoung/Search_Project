// src/pages/FavoritesPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Link } from 'react-router-dom';
// 로그인 상태 확인을 위해 useAuth 훅을 임포트합니다.
// import { useAuth } from '../context/AuthContext'; 

// -----------------------------------------------------
// 1. Styled Components 정의
// -----------------------------------------------------

const FavoritesContainer = styled.div`
    padding: 20px 0;
    max-width: 900px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 25px;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 10px;
`;

// 🚨 누락된 TableCard 스타일 정의
const TableCard = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    padding: 0;
    overflow: hidden; /* 테이블의 모서리가 둥글게 보이도록 */
    margin-bottom: 30px;
`;

const StockTable = styled.table`
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
        text-align: center;
    }

    td:first-child, td:nth-child(2) {
        text-align: center;
    }
    
    .stock-link {
        color: var(--text-dark);
        font-weight: 500;
        &:hover {
            color: var(--primary-blue);
            text-decoration: underline;
        }
    }
    
    .change-rate {
        font-weight: 600;
        color: ${props => 
            props.rate?.startsWith('+') ? 'var(--red-up)' : 
            props.rate?.startsWith('-') ? 'var(--blue-down)' : 
            'var(--text-dark)'
        };
    }
`;

// -----------------------------------------------------
// 2. FavoritesPage 컴포넌트 정의
// -----------------------------------------------------

function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 임시 데이터 (실제 DB 데이터 구조와 동일해야 함)
    const TEMP_FAVORITES = [
        { stockCode: "005930", stockName: "삼성전자", price: 82000, priceChange: 1200, changeRate: "+1.49%", marketCap: "490조" },
        { stockCode: "000660", stockName: "SK하이닉스", price: 156000, priceChange: -2000, changeRate: "-1.26%", marketCap: "113조" },
        { stockCode: "035420", stockName: "NAVER", price: 207000, priceChange: 3000, changeRate: "+1.47%", marketCap: "34조" },
    ];

    useEffect(() => {
        const fetchFavorites = async () => {
            // 🚨 실제 API 연동 시 JWT/세션 정보를 포함해야 합니다.
            try {
                // const response = await axios.get('http://localhost:8484/api/user/favorites', {
                //     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
                // });
                // setFavorites(response.data);
                
                // 임시 데이터를 사용하여 테스트
                setFavorites(TEMP_FAVORITES);
                
            } catch (err) {
                console.error("즐겨찾기 로드 실패", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    return (
        <FavoritesContainer>
            <Title>⭐️ 나의 즐겨찾기 종목</Title>
            <p className="text-gray" style={{marginBottom: '30px'}}>
                총 {favorites.length}개의 종목을 즐겨찾기하고 있습니다.
            </p>

            <TableCard>
                {loading ? (
                    <p style={{textAlign: 'center', padding: '20px'}}>데이터를 불러오는 중...</p>
                ) : favorites.length === 0 ? (
                    <p style={{textAlign: 'center', padding: '20px'}}>즐겨찾기한 종목이 없습니다. 메인 페이지에서 추가해보세요.</p>
                ) : (
                    <StockTable>
                        <thead>
                            <tr>
                                <th>순위</th>
                                <th>종목명</th>
                                <th>현재가</th>
                                <th>전일 대비</th>
                                <th>등락률</th>
                                <th>시가총액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {favorites.map((item, index) => (
                                <tr key={item.stockCode}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {/* 종목 상세 페이지로 이동 */}
                                        <Link to={`/stock/${item.stockCode}`} className="stock-link">
                                            {item.stockName} ({item.stockCode})
                                        </Link>
                                    </td>
                                    {/* 널 체크 및 쉼표 추가 */}
                                    <td>{item.price?.toLocaleString() || '-'}원</td>
                                    
                                    {/* 널 체크 및 색상 적용 */}
                                    <td className="change-rate" rate={item.changeRate}>
                                        {item.priceChange?.toLocaleString() || '-'}원
                                    </td>
                                    <td className="change-rate" rate={item.changeRate}>
                                        {item.changeRate || '-'}
                                    </td>
                                    <td>{item.marketCap || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </StockTable>
                )}
            </TableCard>
        </FavoritesContainer>
    );
}

export default FavoritesPage;