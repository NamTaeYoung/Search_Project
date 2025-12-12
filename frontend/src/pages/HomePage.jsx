import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as Stomp from '@stomp/stompjs'; 
import SockJS from "sockjs-client"; // SockJS 추가

// 🌟 차트 컴포넌트 import (요청하신 대로 원본 유지)
import KosdaqLineChart from '../components/shared/KosdaqLineChart';
import KospiLineChart from '../components/shared/KospiLineChart';

// --- 임시 컴포넌트 ---
const KospiIndexCard = styled.div`
    background-color: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    min-height: 250px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    & > h3 {
        color: #3f51b5;
        margin-bottom: 15px;
    }
`;

const NewsCard = styled.div`
    background-color: #f7f7f7;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    border-left: 5px solid #3f51b5;
    & > p {
        font-size: 0.9rem;
        color: #555;
    }
`;
// -----------------

// --- Styled Components for Layout ---

const HomePageContainer = styled.div`
    padding: 30px;
    background-color: #f0f2f5; 
    min-height: 100vh;
`;

const HeaderSection = styled.header`
    margin-bottom: 40px;
    & > h1 {
        color: #1e3a8a;
        font-weight: 800;
        font-size: 2.5rem;
    }
    & > p {
        color: #6b7280;
        margin-top: 5px;
    }
`;

const IndexAndMarketSection = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 40px;
`;

const MarketStatusCard = styled.div`
    background-color: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const StockList = styled.ul`
    list-style: none;
    padding: 0;
    margin-top: 15px;
    & > li {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dashed #eee;
        font-size: 0.95rem;
    }
`;

const StyledLink = styled(Link)`
    display: flex;
    justify-content: space-between;
    width: 100%;
    text-decoration: none;
    color: inherit;
    cursor: pointer;

    &:hover {
        background-color: #f9fafb; 
    }
`;


const NewsSection = styled.section`
    background-color: #ffffff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const NewsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    & > h2 {
        color: #1e3a8a;
        font-size: 1.8rem;
    }
`;

const KeywordTabs = styled.div`
    display: flex;
    margin-bottom: 20px;
    border-bottom: 2px solid #e5e7eb;
    overflow-x: auto;
    white-space: nowrap;
    cursor: grab;
    user-select: none;

    scrollbar-width: none; 
    &::-webkit-scrollbar {
        display: none; 
    }
`;


const KeywordTab = styled.button`
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: ${props => (props.active ? 'bold' : 'normal')};
    color: ${props => (props.active ? '#3f51b5' : '#6b7280')};
    border-bottom: ${props => (props.active ? '3px solid #3f51b5' : '3px solid transparent')};
    transition: all 0.2s;
    /* 🌟 비표준 prop 경고를 무시하고 DOM에 전달하지 않음 */
    &[active="true"] { 
        font-weight: bold;
        color: #3f51b5;
        border-bottom: 3px solid #3f51b5;
    }
`;

const NewsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr); 
    gap: 20px;
`;

// ----------------------------------------------------
// 🌟 Marquee (애니메이션) 관련 Styled Components
// ----------------------------------------------------

const marquee = keyframes`
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); } 
`;

const StockMarqueeSection = styled.div`
    margin-bottom: 40px;
    overflow: hidden; 
    white-space: nowrap; 
    background-color: #ffffff;
    padding: 10px 0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StockMarqueeContainer = styled.div`
    width: 200%; 
    display: flex; 
`;

const MarqueeContent = styled.div`
    /* flex: 0 0 50%로 너비 고정하여 끊김 없는 순환 구현 */
    flex: 0 0 50%; 
    display: inline-flex; 
    gap: 25px; 
    padding: 0 25px; 
`;

const StockMarqueeAnimated = styled.div`
    animation: ${marquee} 60s linear infinite; 
    width: 100%; 
    display: flex;
    &:hover {
        animation-play-state: paused;
    }
`;

const StockPill = styled.span`
    display: inline-flex; 
    align-items: center;
    justify-content: space-between; 
    
    /* 🔥 핵심 수정: 최소 너비 고정 (멈칫거림 방지) */
    min-width: 130px; 
    
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.1s;
    
    ${props => {
        const rateString = props.rate ? props.rate.toString().replace(/%|\+/g, '') : '0';
        const isPositive = parseFloat(rateString) > 0;
        
        if (isPositive) {
            return css`
                color: #ef4444; 
                background-color: #fef2f2; 
                border: 1px solid #f87171;

                &:hover {
                    transform: translateY(-2px); 
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
            `;
        } 
        
        else if (parseFloat(rateString) < 0) {
            return css`
                color: #3b82f6; 
                background-color: #eff6ff; 
                border: 1px solid #60a5fa;

                &:hover {
                    transform: translateY(-2px); 
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
            `;
        } 
        
        else {
            return css`
                color: #10b981;
                background-color: #ecfdf5;
                border: 1px solid #34d399;

                &:hover {
                    transform: translateY(-2px); 
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
            `;
        }
    }}
`;

const StockName = styled.span`
    /* 🔥 핵심 수정: 종목 이름이 차지하는 공간 확보 */
    flex-grow: 1;
    text-align: left;
    margin-right: 10px; 
`;


// ----------------------------------------------------
// 🌟 유틸리티 함수 (STOMP 및 Flask 통신 로직 포함)
// ----------------------------------------------------

/** 등락률을 포맷합니다. (예: 1.49 -> +1.49%, -1.49 -> -1.49%) */
const formatRate = (rate) => {
    if (rate === undefined || rate === null) return '-';
    const numericRate = Number(rate); 
    if (isNaN(numericRate)) return '-';
    
    const sign = numericRate > 0 ? '+' : '';
    return `${sign}${numericRate.toFixed(2)}%`; 
};

/** Python 프록시 서버에 구독 요청을 보냅니다. (개별 요청) */
const subscribeToProxy = async (codes) => {
    if (!codes || codes.length === 0) return;
    const codesArray = Array.isArray(codes) ? codes : [codes];
    
    const results = await Promise.all(codesArray.map(async (code) => {
        try {
            await axios.post('http://localhost:5000/subscribe', { code }); 
            return { code, success: true };
        } catch (error) {
            console.error(`[Proxy] 구독 요청 실패 (${code}):`, error.response ? error.response.data : error.message);
            return { code, success: false, error: error.response?.data };
        }
    }));
    console.log(`[Proxy] 구독 요청 완료: ${results.filter(r => r.success).map(r => r.code).join(', ')}`);
};

/** Python 프록시 서버에 구독 해제 요청을 보냅니다. (개별 요청) */
const unsubscribeFromProxy = async (codes) => {
    // 🔥 수정: 빈 배열이 들어오면 전체 해제 명령으로 해석 (초기화 또는 언마운트 시)
    if (!codes || codes.length === 0) {
        try {
             // Flask 서버에 전체 해제 명령 전송
             await axios.post('http://localhost:5000/unsubscribe', { codes: [] }); 
             console.log("[Proxy] 전체 구독 초기화 요청 완료.");
        } catch (error) {
             console.error("[Proxy] 전체 구독 초기화 요청 실패:", error.response ? error.response.data : error.message);
        }
        return;
    }
    
    const codesArray = Array.isArray(codes) ? codes : [codes];

    const results = await Promise.all(codesArray.map(async (code) => {
        try {
            await axios.post('http://localhost:5000/unsubscribe', { code }); 
            return { code, success: true };
        } catch (error) {
            console.error(`[Proxy] 해제 요청 실패 (${code}):`, error.response ? error.response.data : error.message);
            return { code, success: false, error: error.response?.data };
        }
    }));
    console.log(`[Proxy] 해제 요청 완료: ${results.filter(r => r.success).map(r => r.code).join(', ')}`);
};


// --- HomePage Function ---
function HomePage() {

    // ✅ 산업 탭 드래그 스크롤용 ref & 상태
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = (e) => {
      setIsDragging(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 1.5; 
      scrollRef.current.scrollLeft = scrollLeft - walk;
    };


    const [indexData, setIndexData] = useState({
      kospi: null,
      kosdaq: null,
    });

    // ✅ ✅ ✅ 최신 지수 불러오기
    useEffect(() => {
      const fetchLatestIndex = async () => {
        try {
            const res = await axios.get('http://localhost:8484/api/chart/latest');
            setIndexData({
            kospi: res.data.kospi,
            kosdaq: res.data.kosdaq,
            });
        } catch(e) { console.error("지수 로딩 실패:", e); }
      };
      fetchLatestIndex();
    }, []);

    
    const [activeKeyword, setActiveKeyword] = useState('Today_Hot');

    // 🌟 1. API 데이터를 저장할 상태
    const [stockData, setStockData] = useState({
        rising: [],
        falling: [],
    });
    const [loading, setLoading] = useState(true);

    // 🌟 2. 백엔드에서 급등/급락 종목 데이터를 불러오는 useEffect
    useEffect(() => {
        const fetchTopMovers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8484/api/stocks/top-movers');
                
                setStockData({
                    rising: response.data.rising,
                    falling: response.data.falling,
                });

            } catch (error) {
                console.error("Top Movers 데이터 로드 실패:", error);
                setStockData({ rising: [], falling: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchTopMovers();
    }, []);


    // ✅ 산업 목록
    const [industries, setIndustries] = useState([]);

    // ✅ 선택된 산업의 뉴스
    const [newsList, setNewsList] = useState([]);
    
    // ✅ 산업 탭 목록 불러오기
    useEffect(() => {
      const fetchIndustries = async () => {
        try {
          const res = await axios.get('http://localhost:8484/api/news/industries');
          setIndustries(res.data);
          setActiveKeyword(res.data[0]); 
        } catch (e) {
          console.error("산업 목록 로딩 실패", e);
        }
      };
      fetchIndustries();
    }, []);

    // ✅ 선택된 산업에 따른 뉴스 불러오기
    useEffect(() => {
      if (!activeKeyword) return;

      const fetchNews = async () => {
        try {
          const res = await axios.get(
            `http://localhost:8484/api/news/by-industry?industry=${activeKeyword}`
          );
          setNewsList(res.data);
        } catch (e) {
          console.error("뉴스 로딩 실패:", e);
        }
      };

    fetchNews();
    }, [activeKeyword]);
    
    // ----------------------------------------------------
    // 🌟 마퀴 실시간 데이터 및 자동 페이징 로직 (핵심 영역)
    // ----------------------------------------------------
    const [marqueeStocks, setMarqueeStocks] = useState([]);
    
    const [realtimeRates, setRealtimeRates] = useState({});
    
    const [currentPage, setCurrentPage] = useState(1); // ✅ 현재 페이지 상태 (1~2)
    const pageSize = 10; // ✅ 페이지당 종목 수 (10개)
    const maxPages = 2; // 🔥 수정: maxPages를 2로 제한
    
    const stompRef = useRef(null); // STOMP 클라이언트 Ref
    const subRefs = useRef({}); 
    // 🔥 1. 전체 구독 코드를 누적하여 저장하는 Set (언마운트 시 전체 해제용)
    const allSubscribedCodesRef = useRef(new Set()); 
    // 2. 현재 페이지의 코드를 저장하는 Ref
    const previousCodesRef = useRef([]); 


    // 1. 자동 페이징 타이머 설정 및 실행
    useEffect(() => {
        // 15초마다 페이지를 넘깁니다.
        const interval = setInterval(() => {
            setCurrentPage(prevPage => (prevPage % maxPages) + 1);
        }, 60000); // 15초 (15000ms) 간격

        return () => clearInterval(interval);
    }, []);


    // 2. STOMP 개별 토픽 구독/해제 로직
    const subscribeStocks = (client, list) => {
        if (!client || !client.connected) return;
        
        const newSubscriptions = {};
        
        // 이전 STOMP 구독 해제
        Object.values(subRefs.current).forEach(sub => sub.unsubscribe());
        
        list.forEach(item => {
            const code = item.code;
            const topic = `/topic/stock/${code}`;
            
            // 🌟 새 구독 (개별 토픽)
            const sub = client.subscribe(topic, (msg) => { 
                const data = JSON.parse(msg.body);
                
                console.log(`📥 [Realtime Marquee] ${code}: ${data.changeRate}`); 

                setRealtimeRates(prev => ({
                    ...prev,
                    [data.code]: {
                        changeRate: formatRate(data.changeRate)
                    }
                }));
            });
            newSubscriptions[code] = sub;
        });

        subRefs.current = newSubscriptions; 
    };


    // 3. 페이지가 바뀔 때마다 데이터 조회, Flask/STOMP 구독 갱신
    const fetchAndSubscribe = async (page) => {
        try {
            // Spring API 호출
            const response = await axios.get(`http://localhost:8484/api/stocks/marketcap?page=${page}&size=${pageSize}`);
            
            const newStocksRaw = response.data.list || [];
            
            const newStocks = newStocksRaw.map(stock => ({
                name: stock.stockName,
                rate: formatRate(stock.changeRate),
                code: stock.stockCode 
            }));

            setMarqueeStocks(newStocks); // 1. 마퀴 종목 업데이트
            
            const currentCodes = newStocks.map(stock => stock.code);
            const previousCodes = previousCodesRef.current; // 이전 페이지 코드 (10개)

            // ------------------------------------------------
            // ⭐ Flask 구독 관리 (이전 10개 해제, 새 10개 구독)
            // ------------------------------------------------

            // 1. 이전 종목 해제 (Flask)
            if (previousCodes.length > 0) {
                unsubscribeFromProxy(previousCodes);
            }

            // 2. 새 종목 구독 (Flask)
            if (currentCodes.length > 0) {
                subscribeToProxy(currentCodes);
                // 🔥 수정: 현재 페이지의 코드를 전체 구독 Set에 추가
                currentCodes.forEach(code => allSubscribedCodesRef.current.add(code)); 
            }

            // 3. STOMP 개별 토픽 구독/해제 갱신
            if (stompRef.current?.connected) {
                subscribeStocks(stompRef.current, newStocks);
            }

            // 4. 현재 코드를 다음 사이클의 '이전 코드'로 저장
            previousCodesRef.current = currentCodes;

        } catch (error) {
            console.error(`마퀴 데이터 로드 및 구독 요청 실패 (Page ${page}):`, error.response ? error.response.data : error.message);
            setMarqueeStocks([]);
            previousCodesRef.current = []; // 오류 시 초기화
        }
    };


    // 4. 페이지 변경 useEffect (currentPage 상태가 바뀔 때만 실행)
    useEffect(() => {
        
        // 🔥 마운트 시 잔여 구독 초기화 요청 (새로고침 문제 해결 - currentPage === 1일 때만 실행)
        if (currentPage === 1) {
            // 빈 배열을 보내 Flask가 전체 해제 명령으로 인식하도록 요청
            unsubscribeFromProxy([]); 
            allSubscribedCodesRef.current.clear(); // Set도 클리어
        }
        
        fetchAndSubscribe(currentPage); 
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]); 

    
    // 5. Spring Boot 웹소켓 연결 (STOMP) - 마운트 시 한번만 실행
    useEffect(() => {
        
        const SOCKET_URL = 'http://localhost:8484/ws-stock'; 
        
        const sock = new SockJS(SOCKET_URL);
        const client = new Stomp.Client({
            webSocketFactory: () => sock,
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            console.log("🟢 [STOMP] 웹소켓 연결 성공.");
            
            // 🔥 해결책: STOMP 연결이 완료된 직후, 현재 페이지의 종목을 다시 구독 요청하여 1페이지 누락 방지
            const currentStocks = marqueeStocks; 
            if (currentStocks.length > 0) {
                 subscribeStocks(client, currentStocks); 
            } else {
                 // 데이터 로드보다 STOMP 연결이 빨랐을 경우, fetchAndSubscribe를 호출하여 데이터 로드와 구독을 모두 시작
                 fetchAndSubscribe(currentPage); 
            }
        };

        client.onStompError = (frame) => {
            console.error('[STOMP] 브로커 오류:', frame);
        };

        client.activate();
        stompRef.current = client;

        // 🔥 컴포넌트 언마운트 시 웹소켓 연결 및 Flask 구독 해제 (클린업 로직)
        return () => {
             // 1. STOMP 개별 구독 모두 해제
             Object.values(subRefs.current).forEach(sub => sub.unsubscribe());

             // 2. 🔥 Flask 구독 해제 요청 (전체 Set 사용 - 20개 모두 해제)
             const codesToUnsubscribe = Array.from(allSubscribedCodesRef.current);
             if (codesToUnsubscribe.length > 0) {
                // Flask에 전체 해제 요청
                unsubscribeFromProxy(codesToUnsubscribe); 
             }

            // 3. STOMP 연결 해제
            if (stompRef.current) {
                stompRef.current.deactivate();
                console.log('[STOMP] 웹소켓 연결 해제.');
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 


    // Marquee 콘텐츠 렌더링 함수
    const renderMarqueeContent = () => (
        <>
            {/* ⭐ 마퀴가 비어있을 경우 로딩 메시지 표시 */}
            {marqueeStocks.length === 0 ? (
                <div style={{ padding: '0 25px', color: '#999', fontSize: '0.9rem', width: '200px' }}>
                    마퀴 종목 데이터를 로드 중입니다...
                </div>
            ) : (
                marqueeStocks.map((stock, index) => {
                    // ✅ 실시간 데이터 확인 및 적용
                    const realtimeRate = realtimeRates[stock.code]?.changeRate || stock.rate;

                    return (
                        <Link
                            key={stock.code || index} 
                            to={`/stock/${stock.code}`} 
                            style={{ textDecoration: 'none' }}
                        >
                            {/* ⭐ 실시간 등락률 적용 */}
                            <StockPill rate={realtimeRate}>
                                <StockName>{stock.name}</StockName>
                                {realtimeRate}
                            </StockPill>
                        </Link>
                    );
                })
            )}
        </>
    );

    // ============================================
    // ⭐ 찜하기 기능 (DB 연동)
    // ============================================
    const [savedNewsIds, setSavedNewsIds] = useState([]);

    // 1. 처음 로딩 시 찜 목록 가져오기
    useEffect(() => {
        const fetchBookmarks = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const res = await axios.get('/api/mypage/favorites/news', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    let rawList = res.data;
                    if (!Array.isArray(rawList) && rawList.data) rawList = rawList.data;
                    if (!Array.isArray(rawList) && rawList.list) rawList = rawList.list;
                    
                    if (Array.isArray(rawList)) {
                        const ids = rawList.map(item => {
                            if (typeof item === 'object' && item !== null) {
                                return String(item.newsId || item.id);
                            }
                            return String(item);
                        }).filter(id => id);
                        
                        setSavedNewsIds(ids);
                    }
                } catch (e) {
                    console.error("찜 목록 로딩 실패:", e);
                }
            }
        };
        fetchBookmarks();
    }, []);

    // 2. 찜하기/해제 핸들러 (DB 요청)
    const handleToggleBookmark = async (news) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return alert("로그인이 필요합니다.");

        const newsId = news.newsId || news.id; 
        if (!newsId) {
            alert("뉴스 ID가 없어 찜할 수 없습니다.");
            return;
        }

        const strNewsId = String(newsId);
        const isBookmarked = savedNewsIds.includes(strNewsId);

        try {
            if (isBookmarked) {
                await axios.delete(`/api/mypage/favorites/news/${newsId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSavedNewsIds(prev => prev.filter(id => id !== strNewsId));
                alert("스크랩을 취소했습니다.");
            } else {
                await axios.post('/api/mypage/favorites/news', 
                    { newsId: newsId }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSavedNewsIds(prev => [...prev, strNewsId]);
                alert("뉴스를 스크랩했습니다.");
            }
        } catch (error) {
            console.error("뉴스 찜 오류:", error);
            alert("처리 중 오류가 발생했습니다.");
        }
    };


    return (
        <HomePageContainer>
            {/* 1. 헤더 */}
            <HeaderSection>
                <h1>메인 경제 대시보드</h1>
                <p>{new Date().toLocaleString('ko-KR', { dateStyle: 'full' })} 현재 시장 상황</p>
            </HeaderSection>

            {/* 2. 지수 및 급등/급락 종목 영역 */}
            <IndexAndMarketSection>
                {/* Kospi 지수 (그래프 포함 영역) */}
                <KospiIndexCard>
                    <h3>🇰🇷 KOSPI 지수</h3>
                    <p>
                      {indexData.kospi
                        ? indexData.kospi.clpr.toLocaleString()
                        : '로딩 중...'}{' '}
                      {indexData.kospi && (
                        <span style={{ color: indexData.kospi.fltRt > 0 ? 'red' : 'blue' }}>
                          ({indexData.kospi.fltRt > 0 ? '+' : ''}
                          {indexData.kospi.fltRt.toFixed(2)}%)
                        </span>
                      )}
                    </p>
                    
                    {/* ⭐ Kospi Line Chart 컴포넌트 삽입 */}
                    <div style={{ 
                        width: '100%', 
                        marginTop: '15px', 
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
                        borderRadius: '6px',
                        padding: '10px',
                        backgroundColor: '#f9f9f9' 
                    }}>
                        <KospiLineChart />
                    </div>
                    
                    <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#888' }}>
                        **그래프 영역** (KospiIndexCard 컴포넌트 내부)
                    </p>
                </KospiIndexCard>

                {/* Kosdaq 지수 (그래프 포함 영역) - Kospi와 동일 스타일 적용 */}
                <KospiIndexCard>
                    <h3>🌐 KOSDAQ 지수</h3>
                    <p>
                      {indexData.kosdaq
                        ? indexData.kosdaq.clpr.toLocaleString()
                        : '로딩 중...'}{' '}
                      {indexData.kosdaq && (
                        <span style={{ color: indexData.kosdaq.fltRt > 0 ? 'red' : 'blue' }}>
                          ({indexData.kosdaq.fltRt > 0 ? '+' : ''}
                          {indexData.kosdaq.fltRt.toFixed(2)}%)
                        </span>
                      )}
                    </p>
                    
                    {/* ⭐ Kosdaq Line Chart 컴포넌트 삽입 */}
                    <div style={{ 
                        width: '100%', 
                        marginTop: '15px', 
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
                        borderRadius: '6px',
                        padding: '10px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <KosdaqLineChart />
                    </div>

                    <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#888' }}>**그래프 영역** (KosdaqIndexCard 컴포넌트 내부)</p>
                </KospiIndexCard>

                {/* 급등/급락 종목 3개씩 - API 데이터 바인딩 */}
                <MarketStatusCard>
                    <h3 style={{ color: '#1e3a8a' }}>🔥 오늘 시장 주도주</h3>
                    
                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '30px' }}>종목 데이터 로드 중...</p>
                    ) : (
                        <>
                            {/* 급등 종목 */}
                            <h4 style={{ color: '#ef4444', marginTop: '20px', borderBottom: '1px solid #fee2e2', paddingBottom: '5px' }}>급등 종목 Top 3</h4>
                            <StockList>
                                {stockData.rising.map((stock, index) => (
                                    <li key={stock.stockCode || index}>
                                        <StyledLink to={`/stock/${stock.stockCode}`}>
                                            <strong>{stock.stockName || '정보 없음'}</strong>
                                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatRate(stock.changeRate)}</span>
                                        </StyledLink>
                                    </li>
                                ))}
                            </StockList>

                            {/* 급락 종목 */}
                            <h4 style={{ color: '#3b82f6', marginTop: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '5px' }}>급락 종목 Top 3</h4>
                            <StockList>
                                {stockData.falling.map((stock, index) => (
                                    <li key={stock.stockCode || index}>
                                        <StyledLink to={`/stock/${stock.stockCode}`}>
                                            <strong>{stock.stockName || '정보 없음'}</strong>
                                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{formatRate(stock.changeRate)}</span>
                                        </StyledLink>
                                    </li>
                                ))}
                            </StockList>
                        </>
                    )}
                </MarketStatusCard>
            </IndexAndMarketSection>

            {/* 🌟 2.5. 움직이는 종목 마퀴 (자동 페이징된 10개 종목 표시) */}
            <StockMarqueeSection>
                {/* 현재 페이지 표시 */}
                <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#666', marginBottom: '10px'}}>
                    시가총액 상위 종목 (페이지 {currentPage}/{maxPages}, 1분마다 자동 갱신)
                </p>
                {/* 🔥 수정: key={currentPage}를 사용하여 애니메이션 리셋 */}
                <div key={currentPage}> 
                    <StockMarqueeContainer>
                        <StockMarqueeAnimated>
                            {/* 콘텐츠를 두 번 렌더링하여 끊김을 방지합니다. */}
                            <MarqueeContent>{renderMarqueeContent()}</MarqueeContent>
                            <MarqueeContent>{renderMarqueeContent()}</MarqueeContent> 
                        </StockMarqueeAnimated>
                    </StockMarqueeContainer>
                </div>
            </StockMarqueeSection>

            {/* 3. 뉴스 및 이슈 키워드 영역 */}
            <NewsSection>
                <NewsHeader>
                    <h2>📰 오늘의 주요 이슈 및 뉴스</h2>
                    <Link to="/trend" style={{ color: '#3f51b5', textDecoration: 'none', fontWeight: '600' }}>
                        더보기 &gt;
                    </Link>
                </NewsHeader>

                {/* 키워드 탭 */}
                <KeywordTabs
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    >
                    {industries.map((keyword) => (
                        <KeywordTab
                            key={keyword}
                            active={(activeKeyword === keyword).toString()} 
                            onClick={() => setActiveKeyword(keyword)}
                        >
                            {keyword.replace('_', ' ')}
                        </KeywordTab>
                    ))}
                </KeywordTabs>

                {/* 뉴스 리스트 (선택된 키워드에 따라) */}
                <NewsGrid>
                    {newsList.length === 0 ? (
                        <div style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            padding: "40px 0",
                            color: "#888",
                            fontSize: "1rem"
                        }}>
                            📭 해당 산업의 뉴스가 없습니다.
                        </div>
                    ) : (
                        newsList.map((news, index) => {
                            const newsId = news.newsId || news.id;
                            const isBookmarked = savedNewsIds.includes(String(newsId));

                            return (
                                <NewsCard key={index}>
                                    <h4 style={{ color: '#1e3a8a', marginBottom: '5px' }}>
                                        {news.title}
                                    </h4>
                                    <p>{news.content}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <a
                                            href={news.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#6366f1',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            원문 보기 &gt;
                                        </a>

                                        {/* ⭐ DB 연동된 별표 버튼 */}
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleToggleBookmark(news); 
                                            }}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer',
                                                padding: '5px'
                                            }}
                                            title={isBookmarked ? "찜 해제" : "찜하기"}
                                        >
                                            <svg 
                                                width="24" 
                                                height="24" 
                                                viewBox="0 0 24 24" 
                                                fill={isBookmarked ? "#FFD700" : "none"} 
                                                stroke={isBookmarked ? "#FFD700" : "#ccc"} 
                                                strokeWidth="2"
                                            >
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </NewsCard>
                            );
                        })
                    )}
                </NewsGrid>

            </NewsSection>
        </HomePageContainer>
    );
}

export default HomePage;