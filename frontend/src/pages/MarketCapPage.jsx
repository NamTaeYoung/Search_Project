import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// -----------------------------------------------------
// 1. 데이터 포맷팅 유틸리티
// -----------------------------------------------------

const formatChangeRate = (rate) => {
    if (rate === undefined || rate === null || rate === "") return '-';
    const numericRate = Number(rate); 
    if (isNaN(numericRate)) return '-';
    const sign = numericRate > 0 ? '+' : (numericRate < 0 ? '' : '');
    return `${sign}${numericRate.toFixed(2)}%`; 
};

const formatMarketCap = (capString) => {
    if (!capString) return '-';
    return capString.trim();
};

// -----------------------------------------------------
// 2. 스타일 객체 정의 (styled-components 대체)
// -----------------------------------------------------

const styles = {
    container: {
        padding: '20px 0',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
    },
    title: {
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '25px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
        color: '#333',
    },
    description: {
        color: '#666',
        marginBottom: '20px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
        padding: '0',
        overflow: 'hidden',
        border: '1px solid #eee',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '12px 15px',
        textAlign: 'center',
        borderBottom: '1px solid #eee',
        fontSize: '14px',
        backgroundColor: '#f8f9fa',
        fontWeight: '600',
        color: '#333',
    },
    td: {
        padding: '12px 15px',
        textAlign: 'right',
        borderBottom: '1px solid #eee',
        fontSize: '14px',
        color: '#333',
    },
    tdCenter: {
        padding: '12px 15px',
        textAlign: 'center',
        borderBottom: '1px solid #eee',
        fontSize: '14px',
        color: '#333',
    },
    link: {
        textDecoration: 'none',
        color: '#333',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
        padding: '40px',
        textAlign: 'center',
    }
};

// -----------------------------------------------------
// 3. MarketCapPage 컴포넌트
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
                // API 호출
                const response = await axios.get('/api/stocks/marketcap');
                setRankingData(response.data);
            } catch (err) {
                console.error("시총 데이터 로드 실패:", err);
                setError("데이터 로드에 실패했습니다.");
                setRankingData([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchRankingData();
    }, []);

    // 등락률에 따른 색상 반환 함수
    const getColor = (rate) => {
        if (rate > 0) return '#ef4444'; // 빨강 (상승)
        if (rate < 0) return '#3b82f6'; // 파랑 (하락)
        return '#333'; // 검정 (보합)
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>시가총액 순위 TOP 100</h1>
            <p style={styles.description}>
                실시간 시가총액 순위 정보를 제공합니다.
            </p>

            <div style={styles.card}>
                {loading ? (
                    <p style={styles.loading}>데이터를 불러오는 중...</p>
                ) : error ? (
                    <p style={styles.error}>{error}</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>순위</th>
                                <th style={styles.th}>종목명</th>
                                <th style={styles.th}>업종</th>
                                <th style={styles.th}>현재가</th>
                                <th style={styles.th}>전일 대비</th>
                                <th style={styles.th}>등락률</th>
                                <th style={styles.th}>시가총액</th>
                                <th style={styles.th}>업데이트</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankingData.map((item, index) => {
                                const rateString = formatChangeRate(item.changeRate);
                                const colorStyle = { color: getColor(item.changeRate), fontWeight: '600' };
                                
                                const formattedPrice = item.price?.toLocaleString() || '-';
                                const formattedChange = item.priceChange?.toLocaleString() || '-';
                                const formattedMarketCap = formatMarketCap(item.marketCap);

                                return (
                                    <tr key={item.stockCode || index}>
                                        <td style={styles.tdCenter}>{index + 1}</td>
                                        
                                        {/* 종목명에 링크 연결 */}
                                        <td style={styles.tdCenter}>
                                            <Link 
                                                to={`/stock/${item.stockCode}`}
                                                style={styles.link}
                                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                                            >
                                                {item.stockName || '-'}
                                            </Link>
                                        </td>

                                        <td style={styles.td}>{item.industry || 'ETF'}</td>
                                        <td style={styles.td}>{formattedPrice !== '-' ? formattedPrice + '원' : '-'}</td>
                                        
                                        <td style={{ ...styles.td, ...colorStyle }}>
                                            {formattedChange !== '-' ? formattedChange : '-'} 
                                        </td>
                                        
                                        <td style={{ ...styles.td, ...colorStyle }}>
                                            {rateString}
                                        </td>
                                        
                                        <td style={styles.td}>{formattedMarketCap}</td>
                                        
                                        <td style={styles.td}>
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default MarketCapPage;