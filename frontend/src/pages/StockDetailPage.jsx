// ==========================================
// StockDetailPage.jsx (실시간 주가 반영 버전 완성본)
// ==========================================

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ==========================================
// 1. 스타일 객체
// ==========================================
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  header: {
    borderBottom: '2px solid #333',
    paddingBottom: '20px',
    marginBottom: '30px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stockTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  stockTitle: {
    margin: '0',
    color: '#333',
    display: 'flex',
    alignItems: 'baseline',
    fontSize: '2em',
    fontWeight: 'bold',
  },
  stockCode: {
    fontSize: '18px',
    color: '#666',
    marginLeft: '10px',
    fontWeight: 'normal',
  },
  priceContainer: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '15px',
  },
  price: {
    fontSize: '36px',
    fontWeight: 'bold',
  },
  changeInfo: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  metaData: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#666',
    display: 'flex',
    gap: '20px',
  },
  metaSpan: {
    display: 'inline-block',
  },
  section: {
    marginBottom: '40px',
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #eee',
  },
  sectionTitle: {
    marginBottom: '15px',
    borderLeft: '4px solid #007bff',
    paddingLeft: '10px',
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#333',
  },
  sentimentBarContainer: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    height: '20px',
    backgroundColor: '#eee',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
  },
  sentimentStats: {
    display: 'flex',
    gap: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  newsItemWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #eee',
    padding: '15px 0',
  },
  newsContent: {
    flex: 1,
    paddingRight: '15px',
  },
  newsLink: {
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '17px',
    display: 'block',
    marginBottom: '8px',
    cursor: 'pointer',
  },
  newsSummary: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  newsInfo: {
    fontSize: '12px',
    color: '#888',
    display: 'flex',
    gap: '10px',
  },
  sentimentBadge: {
    fontWeight: 'bold',
    marginRight: '5px',
  },
  noNews: {
    textAlign: 'center',
    color: '#888',
  },
  starButton: {
    background: 'none',
    border: 'none',
    fontSize: '40px',
    cursor: 'pointer',
    color: '#FFD700',
    transition: 'transform 0.2s',
    padding: '0 10px',
  },
  starButtonEmpty: {
    color: '#ccc',
  },
  newsStarButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#ccc',
    padding: '5px',
    transition: 'color 0.2s',
    marginTop: '5px',
  },
  newsStarActive: {
    color: '#FFD700',
  },
};

// ==========================================
// 2. 컴포넌트
// ==========================================
function StockDetailPage() {
  const { stockCode } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ 실시간 데이터 상태
  const [rtPrice, setRtPrice] = useState(null);
  const [rtPriceChange, setRtPriceChange] = useState(null);
  const [rtChangeRate, setRtChangeRate] = useState(null);

  // 기존 즐겨찾기/뉴스 상태
  const [isFavorite, setIsFavorite] = useState(false);
  const [savedBookmarks, setSavedBookmarks] = useState([]);

  // STOMP 객체
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // ==========================================
  // ① 기본 상세 정보 로드
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 주식 기본 정보
        const stockRes = await axios.get(`/api/stocks/${stockCode}`);
        setData(stockRes.data);

        // 로그인 상태면 즐겨찾기 정보 로드
        const token = localStorage.getItem('accessToken');
        if (token) {
          const authHeader = { headers: { Authorization: `Bearer ${token}` } };

          const myRes = await axios.get('/api/mypage/info', authHeader);
          const myStocks = myRes.data.stocks || [];
          setIsFavorite(myStocks.some(s => s.stockCode === stockCode));

          const newsRes = await axios.get('/api/mypage/favorites/news', authHeader);
          let rawList = newsRes.data;
          if (!Array.isArray(rawList) && rawList.data) rawList = rawList.data;
          if (!Array.isArray(rawList) && rawList.list) rawList = rawList.list;

          if (Array.isArray(rawList)) {
            const bookmarks = rawList.map(item => ({
              newsId: String(item.newsId || item.id),
              isRead: item.isRead
            })).filter(b => b.newsId !== 'undefined');
            setSavedBookmarks(bookmarks);
          }
        }
      } catch (err) {
        console.error(err);
        alert("정보 불러오기 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stockCode]);

  // ==========================================
  // ② 실시간 주식 WebSocket 구독
  // ==========================================
  useEffect(() => {
    if (!stockCode) return;

    // Flask에 구독 요청
    fetch(`http://localhost:5000/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: stockCode }),
    });

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8484/ws-stock"),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      subscriptionRef.current = client.subscribe(
        `/topic/stock/${stockCode}`,
        (msg) => {
          const d = JSON.parse(msg.body);
          setRtPrice(d.currentPrice);
          setRtPriceChange(d.priceChange);
          setRtChangeRate(d.changeRate);
        }
      );
    };

    client.activate();
    stompClientRef.current = client;

    // 창 닫기/페이지 이동 시 구독 해제
    const handleUnload = () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (stompClientRef.current) stompClientRef.current.deactivate();

      navigator.sendBeacon(
        "http://localhost:5000/unsubscribe",
        JSON.stringify({ code: stockCode })
      );
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [stockCode]);

  // ==========================================
  // ③ 찜하기 / 뉴스 스크랩 / 읽음 처리 함수
  // ==========================================
  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert("로그인이 필요합니다.");

    try {
      if (isFavorite) {
        await axios.delete(`/api/mypage/favorites/stock/${stockCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
      } else {
        await axios.post('/api/mypage/favorites/stock', { stockCode }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleNewsBookmark = async (news) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("로그인이 필요합니다.");

    const newsId = String(news.newsId || news.id);
    const isBookmarked = savedBookmarks.some(b => b.newsId === newsId);

    try {
      if (isBookmarked) {
        await axios.delete(`/api/mypage/favorites/news/${newsId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSavedBookmarks(prev => prev.filter(b => b.newsId !== newsId));
      } else {
        await axios.post(
          "/api/mypage/favorites/news",
          { newsId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSavedBookmarks(prev => [...prev, { newsId, isRead: "N" }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewsClick = async (newsId, url, isBookmarked) => {
    window.open(url, "_blank", "noopener,noreferrer");
    const token = localStorage.getItem("accessToken");
    if (!token || !isBookmarked) return;

    try {
      await axios.post(
        "/api/mypage/favorites/news/read",
        { newsId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSavedBookmarks(prev =>
        prev.map(b =>
          b.newsId === String(newsId) ? { ...b, isRead: "Y" } : b
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // 화면 렌더링
  // ==========================================
  if (loading) return <div style={styles.container}>로딩중...</div>;
  if (!data) return <div style={styles.container}>데이터가 없습니다.</div>;

  const { stockInfo, newsList, sentiment } = data;

  // ------------------------------
  // ⭐ 실시간 가격 적용 (fallback: 기본 DB 가격)
  // ------------------------------
  const displayPrice = rtPrice ?? stockInfo.price;
  const displayChange = rtPriceChange ?? stockInfo.priceChange;
  const displayRate = rtChangeRate ?? stockInfo.changeRate;

  const priceColor =
    displayRate > 0 ? "#d60000"
    : displayRate < 0 ? "#0051c7"
    : "#333";

  const priceSign =
    displayRate > 0 ? "▲"
    : displayRate < 0 ? "▼"
    : "-";

  return (
    <div style={styles.container}>
      
      {/* -------------------------- */}
      {/*   헤더 / 가격 / 메타 정보    */}
      {/* -------------------------- */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.stockTitleGroup}>
            <h1 style={styles.stockTitle}>
              {stockInfo.stockName}
              <span style={styles.stockCode}>{stockInfo.stockCode}</span>
            </h1>

            <div style={styles.priceContainer}>
              <div style={{ ...styles.price, color: priceColor }}>
                {displayPrice?.toLocaleString()}원
              </div>
              <div style={{ ...styles.changeInfo, color: priceColor }}>
                {priceSign} {Math.abs(displayChange).toLocaleString()}  
                <span style={{ marginLeft: '5px' }}>({displayRate}%)</span>
              </div>
            </div>
          </div>

          {/* 종목 찜 버튼 */}
          <button
            style={{
              ...styles.starButton,
              ...(isFavorite ? {} : styles.starButtonEmpty),
            }}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>

        <div style={styles.metaData}>
          <span style={styles.metaSpan}>
            <strong>시장:</strong> {stockInfo.marketType}
          </span>
          <span style={styles.metaSpan}>
            <strong>업종:</strong>{" "}
            <Link to={`/industry/${stockInfo.industry || "ETF"}`}>
              {stockInfo.industry || "ETF"}
            </Link>
          </span>
          <span style={styles.metaSpan}>
            <strong>시가총액:</strong> {stockInfo.marketCap}
          </span>
          <span style={styles.metaSpan}>
            <strong>기준일:</strong> {stockInfo.updatedAt}
          </span>
        </div>
      </div>

      {/* -------------------------- */}
      {/*   감성 분석 섹션            */}
      {/* -------------------------- */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🤖 AI 뉴스 감성 분석</h3>
        <div style={styles.sentimentBarContainer}>
          <div style={styles.barWrapper}>
            <div style={{ width: `${sentiment?.positiveRate}%`, backgroundColor: "#d60000" }} />
            <div style={{ width: `${sentiment?.neutralRate}%`, backgroundColor: "#999" }} />
            <div style={{ width: `${sentiment?.negativeRate}%`, backgroundColor: "#0051c7" }} />
          </div>

          <div style={styles.sentimentStats}>
            <div style={{ color: "#d60000" }}>긍정 {sentiment?.positiveCount}건</div>
            <div style={{ color: "#0051c7" }}>부정 {sentiment?.negativeCount}건</div>
          </div>
        </div>
      </div>

      {/* -------------------------- */}
      {/*   뉴스 리스트               */}
      {/* -------------------------- */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📰 관련 주요 뉴스</h3>

        {newsList.length > 0 ? (
          newsList.map((news) => {
            const newsId = String(news.newsId || news.id);
            const bookmark = savedBookmarks.find(b => b.newsId === newsId);
            const isBookmarked = !!bookmark;
            const isRead = bookmark?.isRead === "Y";

            return (
              <div key={newsId} style={styles.newsItemWrapper}>
                <div style={styles.newsContent}>
                  
                  <a
                    href={news.url}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNewsClick(newsId, news.url, isBookmarked);
                    }}
                    style={{
                      ...styles.newsLink,
                      color: isRead ? "#bbb" : "#333",
                      textDecoration: isRead ? "line-through" : "none",
                    }}
                  >
                    {news.title}
                  </a>

                  <div style={styles.newsSummary}>{news.content}</div>

                  <div style={styles.newsInfo}>
                    <span
                      style={{
                        ...styles.sentimentBadge,
                        color:
                          news.sentiment === "긍정"
                            ? "#d60000"
                            : news.sentiment === "부정"
                            ? "#0051c7"
                            : "#666",
                      }}
                    >
                      [{news.sentiment}]
                    </span>
                    <span>{news.newsDate}</span>
                    <span>키워드: {news.keywords}</span>
                  </div>
                </div>

                {/* 뉴스 찜 버튼 */}
                <button
                  onClick={() => handleToggleNewsBookmark(news)}
                  style={{
                    ...styles.newsStarButton,
                    ...(isBookmarked ? styles.newsStarActive : {}),
                  }}
                >
                  {isBookmarked ? "★" : "☆"}
                </button>
              </div>
            );
          })
        ) : (
          <p style={styles.noNews}>관련 뉴스가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default StockDetailPage;
