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
// 2. 스타일 객체
// -----------------------------------------------------

const styles = {
    container: { padding: '20px 0', maxWidth: '1200px', margin: '0 auto' },
    title: { fontSize: '24px', fontWeight: '600', marginBottom: '25px' },
    card: { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px', textAlign: 'center', backgroundColor: '#f8f9fa' },
    td: { padding: '12px', textAlign: 'right' },
    tdCenter: { padding: '12px', textAlign: 'center' },
    link: { textDecoration: 'none', color: '#333', fontWeight: 'bold' },
    paging: { display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px' }
};

// -----------------------------------------------------
// 3. 컴포넌트
// -----------------------------------------------------

function MarketCapPage() {
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ 페이징 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchRankingData = async () => {
            const response = await axios.get('/api/stocks/marketcap');
            setRankingData(response.data);
            setLoading(false);
        };
        fetchRankingData();
    }, []);

    // ✅ 현재 페이지 데이터 계산
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = rankingData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(rankingData.length / itemsPerPage);

    const getColor = (rate) => {
        if (rate > 0) return '#ef4444';
        if (rate < 0) return '#3b82f6';
        return '#333';
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>시가총액 순위 TOP 100</h1>

            <div style={styles.card}>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '40px' }}>로딩중...</p>
                ) : (
                    <>
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
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => {
                                    const rateString = formatChangeRate(item.changeRate);
                                    const colorStyle = { color: getColor(item.changeRate), fontWeight: '600' };

                                    return (
                                        <tr key={item.stockCode}>
                                            <td style={styles.tdCenter}>
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>

                                            <td style={styles.tdCenter}>
                                                <Link to={`/stock/${item.stockCode}`} style={styles.link}>
                                                    {item.stockName}
                                                </Link>
                                            </td>

                                            <td style={styles.td}>{item.industry || 'ETF'}</td>
                                            <td style={styles.td}>{item.price?.toLocaleString()}원</td>
                                            <td style={{ ...styles.td, ...colorStyle }}>
                                                {item.priceChange?.toLocaleString()}
                                            </td>
                                            <td style={{ ...styles.td, ...colorStyle }}>
                                                {rateString}
                                            </td>
                                            <td style={styles.td}>{formatMarketCap(item.marketCap)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* ✅ 페이징 버튼 */}
                        <div style={styles.paging}>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #ccc',
                                        background: currentPage === i + 1 ? '#333' : '#fff',
                                        color: currentPage === i + 1 ? '#fff' : '#333',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default MarketCapPage;
