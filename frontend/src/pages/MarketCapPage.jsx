import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// ------------------------
// 데이터 포맷팅
// ------------------------
const formatChangeRate = (rate) => {
  if (rate === undefined || rate === null || rate === "") return '-';
  const numericRate = Number(rate);
  if (isNaN(numericRate)) return '-';
  const sign = numericRate > 0 ? '+' : (numericRate < 0 ? '' : '');
  return `${sign}${numericRate.toFixed(2)}%`;
};

const formatMarketCap = (capString) => (!capString ? '-' : capString.trim());

// ------------------------
// 스타일
// ------------------------
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

// ------------------------
// 컴포넌트
// ------------------------
function MarketCapPage() {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const stompRef = useRef(null);
  const subRefs = useRef([]);
  const subscribedFlaskRef = useRef(new Set());

  // -------------------------------
  // REST: 시가총액 데이터 가져오기
  // -------------------------------
  const fetchRankingData = async (page) => {
    setLoading(true);
    const response = await axios.get(
      `/api/stocks/marketcap?page=${page}&size=${itemsPerPage}`
    );
    const list = response.data.list || [];
    const totalCount = response.data.totalCount || 0;

    setRankingData(list);
    setTotalPages(Math.ceil(totalCount / itemsPerPage));
    setLoading(false);

    // 페이지 변경 시 구독 갱신
    resetSubscriptions(list);
  };

  // -------------------------------
  // STOMP WebSocket 연결
  // -------------------------------
  useEffect(() => {
    const sock = new SockJS("http://localhost:8484/ws-stock");
    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("🟢 WebSocket 연결 성공");
      // 초기 페이지 데이터 fetch 후 구독
      fetchRankingData(currentPage);
    };

    client.onStompError = (frame) => {
      console.error("STOMP 오류:", frame);
    };

    client.activate();
    stompRef.current = client;

    return () => {
      // 언마운트 시 전체 구독 해제
      subRefs.current.forEach(sub => sub.unsubscribe());
      subRefs.current = [];
      if (client) client.deactivate();
      unsubscribeFlask(Array.from(subscribedFlaskRef.current));
    };
  }, []);

  // -------------------------------
  // STOMP 구독 초기화 + 새 구독
  // -------------------------------
  const subscribeStocks = (list) => {
    const client = stompRef.current;
    if (!client || !client.connected) return;

    subRefs.current.forEach(sub => sub.unsubscribe());
    subRefs.current = [];

    list.forEach(item => {
      const code = item.stockCode;
      const sub = client.subscribe(`/topic/stock/${code}`, (msg) => {
        const data = JSON.parse(msg.body);
        setRankingData(prev =>
          prev.map(row =>
            row.stockCode === code
              ? { ...row, price: data.currentPrice, priceChange: data.priceChange, changeRate: data.changeRate }
              : row
          )
        );
      });
      subRefs.current.push(sub);
    });
  };

  // -------------------------------
  // Flask 구독 초기화 + 새 구독
  // -------------------------------
  const subscribeFlask = (list) => {
    // 이전 구독 해제
    unsubscribeFlask(Array.from(subscribedFlaskRef.current));

    // 새 구독
    list.forEach(item => {
      const code = item.stockCode;
      fetch("http://localhost:5000/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      subscribedFlaskRef.current.add(code);
    });
  };

  const unsubscribeFlask = (codes) => {
    if (!codes || codes.length === 0) return;
    fetch("http://localhost:5000/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes }),
    });
    codes.forEach(code => subscribedFlaskRef.current.delete(code));
  };

  // -------------------------------
  // 전체 구독 리셋 (페이지 변경 시)
  // -------------------------------
  const resetSubscriptions = (list) => {
    if (!stompRef.current?.connected) return;
    subscribeStocks(list);
    subscribeFlask(list);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRankingData(page);
  };

  const getColor = (rate) => rate > 0 ? '#ef4444' : rate < 0 ? '#3b82f6' : '#333';

  // -------------------------------
  // 렌더링
  // -------------------------------
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
                {rankingData.map((item, idx) => {
                  const rateStr = formatChangeRate(item.changeRate);
                  const colorStyle = { color: getColor(item.changeRate), fontWeight: '600' };
                  return (
                    <tr key={item.stockCode}>
                      <td style={styles.tdCenter}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td style={styles.tdCenter}>
                        <Link to={`/stock/${item.stockCode}`} style={styles.link}>{item.stockName}</Link>
                      </td>
                      <td style={styles.td}>
                        <Link to={`/industry/${item.industry}`} style={{ marginLeft: '5px', color: '#007bff' }}>
                          {item.industry || 'ETF'}
                        </Link>
                      </td>
                      <td style={styles.td}>{item.price?.toLocaleString()}원</td>
                      <td style={{ ...styles.td, ...colorStyle }}>{item.priceChange?.toLocaleString()}</td>
                      <td style={{ ...styles.td, ...colorStyle }}>{rateStr}</td>
                      <td style={styles.td}>{formatMarketCap(item.marketCap)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={styles.paging}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
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
