// src/pages/KeywordTrendPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// ============================================
// 유틸리티 함수 (재사용)
// ============================================

const formatChangeRate = (rate) => {
    if (rate === undefined || rate === null || rate === "") return '-';
    const numericRate = Number(rate);
    if (isNaN(numericRate)) return '-';
    const sign = numericRate > 0 ? '+' : '';
    return `${sign}${numericRate.toFixed(2)}%`;
};

const formatPrice = (price) => {
    if (!price) return '-';
    const num = Number(price);
    if (isNaN(num)) return '-';
    return num.toLocaleString('ko-KR');
};

const formatMarketCap = (cap) => {
    if (!cap) return '-';
    const num = Number(cap);
    if (isNaN(num)) return '-';
    if (num >= 1000000000000) {
        return `${(num / 1000000000000).toFixed(1)}조`;
    } else if (num >= 100000000) {
        return `${(num / 100000000).toFixed(0)}억`;
    }
    return num.toLocaleString('ko-KR');
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        let date;
        if (typeof dateStr === 'string' && dateStr.length === 8 && /^\d+$/.test(dateStr)) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            date = new Date(`${year}-${month}-${day}`);
        } else {
            date = new Date(dateStr);
        }
        
        if (isNaN(date.getTime())) {
            return dateStr || '날짜 정보 없음';
        }
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 365 * 20) {
            return '날짜 정보 없음';
        }
        
        return date.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    } catch {
        return dateStr || '날짜 정보 없음';
    }
};

const getColor = (rate) => rate > 0 ? '#dc2626' : rate < 0 ? '#2563eb' : '#64748b';


// ============================================
// Flask 구독/해제 유틸리티 (배열 처리)
// ============================================

const unsubscribeFlask = (codes) => {
    if (!codes || codes.length === 0) return;
    // MarketCapPage의 로직을 그대로 사용 (배열을 POST)
    fetch("http://localhost:5000/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
    }).catch(error => {
        console.error(`[Flask Unsubscribe Error] ${codes.join(', ')}:`, error);
    });
};

// ============================================
// Styled Components (원본 유지)
// ============================================

const TrendContainer = styled.div`
    padding: 40px 30px;
    max-width: 1600px;
    margin: 0 auto;
    background: #f5f7fa;
    min-height: 100vh;
`;

const Title = styled.h1`
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 10px;
    color: #0f172a;
    letter-spacing: -1px;
`;

const Description = styled.p`
    font-size: 16px;
    color: #64748b;
    margin-bottom: 40px;
    line-height: 1.7;
`;

const TrendGrid = styled.div`
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 24px;
    align-items: start;
    
    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const KeywordSection = styled.div`
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 100px);
    display: flex;
    flex-direction: column;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #0f172a;
    padding-bottom: 12px;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
`;

const KeywordList = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
        
        &:hover {
            background: #94a3b8;
        }
    }
`;

const KeywordItem = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 14px;
    margin-bottom: 8px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: #ffffff;
    border: 1.5px solid transparent;
    gap: 12px;
    
    &:hover {
        background: #f8fafc;
        border-color: #e2e8f0;
        transform: translateX(2px);
    }
    
    &.active {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border-color: #3b82f6;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
    }
`;

const Rank = styled.span`
    font-weight: 700;
    color: #64748b;
    min-width: 40px;
    font-size: 14px;
    text-align: center;
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 8px;
    flex-shrink: 0;
`;

const KeywordName = styled.span`
    font-weight: 600;
    color: #1e293b;
    margin-right: 12px;
    flex: 0 0 auto;
    font-size: 15px;
    letter-spacing: -0.2px;
    min-width: 70px;
`;

const ScoreBarContainer = styled.div`
    flex: 1;
    background-color: #f1f5f9;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin-right: 10px;
    max-width: 180px;
    min-width: 0;
`;

const ScoreBar = styled.div`
    height: 100%;
    width: ${props => props.percentage}%;
    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 4px;
`;

const ScoreValue = styled.span`
    font-size: 13px;
    color: #64748b;
    min-width: 45px;
    text-align: right;
    font-weight: 600;
    flex-shrink: 0;
`;

const RelatedSection = styled.div`
    background: #ffffff;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #94a3b8;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    & > p {
        font-size: 15px;
        margin-top: 12px;
        font-weight: 500;
    }
`;

const LoadingState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
    font-size: 15px;
    font-weight: 500;
`;

const ErrorState = styled.div`
    text-align: center;
    padding: 24px;
    color: #dc2626;
    background: #fef2f2;
    border-radius: 12px;
    border: 1px solid #fecaca;
    font-weight: 600;
    margin-bottom: 24px;
`;

const StockList = styled.div`
    margin-bottom: 32px;
`;

const StockListTitle = styled.h3`
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StockGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const StockCard = styled(Link)`
    display: block;
    padding: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 14px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    
    &:hover {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-color: #3b82f6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
`;

const StockCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
`;

const StockCardName = styled.div`
    font-weight: 700;
    color: #0f172a;
    font-size: 17px;
    letter-spacing: -0.3px;
    line-height: 1.3;
`;

const StockCardChange = styled.div`
    font-weight: 700;
    font-size: 16px;
    padding: 4px 10px;
    border-radius: 8px;
    background: ${props => 
        props.isPositive ? '#fef2f2' : 
        props.isNegative ? '#eff6ff' : '#f1f5f9'};
    color: ${props => 
        props.isPositive ? '#dc2626' : 
        props.isNegative ? '#2563eb' : '#64748b'};
    white-space: nowrap; /* ⭐ 등락률 텍스트가 잘리지 않도록 추가 */
`;

const StockCardInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    font-size: 13px;
    color: #64748b;
`;

const StockCardMarket = styled.span`
    font-weight: 500;
`;

const StockCardNews = styled.span`
    background: #3b82f6;
    color: #ffffff;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 12px;
`;

const NewsList = styled.div`
    margin-top: 8px;
`;

const NewsListTitleWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    flex-wrap: wrap;
    gap: 12px;
`;

const NewsListTitle = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
`;

const SentimentFilterGroup = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const SentimentFilterButton = styled.button`
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    border: 1.5px solid #e2e8f0;
    background: #ffffff;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
    }
    
    &.active {
        background: ${props => 
            props.filterType === '전체' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
            props.filterType === '긍정' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
            props.filterType === '보통' ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' :
            'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
`;

const NewsItem = styled.div`
    padding: 20px;
    margin-bottom: 16px;
    background: #ffffff;
    border-radius: 14px;
    border-left: 4px solid ${props => 
        props.sentiment === '긍정' ? '#10b981' : 
        props.sentiment === '부정' ? '#ef4444' : '#64748b'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    
    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-1px);
        border-color: ${props => 
            props.sentiment === '긍정' ? '#10b981' : 
            props.sentiment === '부정' ? '#ef4444' : '#64748b'};
    }
`;

const NewsTitle = styled.h4`
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #0f172a;
    line-height: 1.5;
    letter-spacing: -0.3px;
`;

const NewsContent = styled.p`
    font-size: 14px;
    color: #64748b;
    margin-bottom: 14px;
    line-height: 1.7;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const NewsMeta = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 13px;
    color: #94a3b8;
`;

const SentimentBadge = styled.span`
    padding: 5px 11px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 12px;
    background-color: ${props => 
        props.sentiment === '긍정' ? '#d1fae5' : 
        props.sentiment === '부정' ? '#fee2e2' : '#f1f5f9'};
    color: ${props => 
        props.sentiment === '긍정' ? '#065f46' : 
        props.sentiment === '부정' ? '#991b1b' : '#475569'};
    border: 1px solid ${props => 
        props.sentiment === '긍정' ? '#a7f3d0' : 
        props.sentiment === '부정' ? '#fecaca' : '#e2e8f0'};
`;

const NewsLink = styled.a`
    color: #3b82f6;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;
    
    &:hover {
        background-color: #eff6ff;
        text-decoration: underline;
    }
`;

const ShowMoreButton = styled.button`
    margin-top: 16px;
    padding: 8px 16px;
    background: ${props => props.showAll 
        ? '#f1f5f9' 
        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
    color: ${props => props.showAll ? '#64748b' : '#ffffff'};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    width: auto;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: ${props => props.showAll ? 'none' : '0 2px 6px rgba(59, 130, 246, 0.2)'};
    align-self: flex-start;
    
    &:hover {
        transform: ${props => props.showAll ? 'none' : 'translateY(-1px)'};
        box-shadow: ${props => props.showAll ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'};
    }
`;

// ============================================
// Main Component
// ============================================

function KeywordTrendPage() {
    const [keywords, setKeywords] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState(null);
    const [stocks, setStocks] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [error, setError] = useState(null);
    const [sentimentFilter, setSentimentFilter] = useState('전체');
    const [shouldScroll, setShouldScroll] = useState(false);
    const [showAllStocks, setShowAllStocks] = useState(false);
    
    // ⭐ 실시간 시세 상태: { [stockCode]: { currentPrice, priceChange, changeRate } }
    const [rtStockData, setRtStockData] = useState({}); 

    // ⭐ STOMP 및 Flask 구독 Ref
    const stompRef = useRef(null);
    const subRefs = useRef([]);
    const subscribedFlaskRef = useRef(new Set()); 

    const relatedSectionRef = useRef(null);

    // ============================================
    // STOMP/Flask 구독 및 해제 로직
    // ============================================

    // STOMP 구독 초기화 + 새 구독
    const subscribeStocks = useCallback((list) => {
        const client = stompRef.current;
        if (!client || !client.connected) return;

        // 기존 STOMP 구독 해제
        subRefs.current.forEach(sub => sub.unsubscribe());
        subRefs.current = [];
        setRtStockData({}); // 실시간 데이터 상태 초기화

        list.forEach(item => {
            const code = item.stockCode;
            const sub = client.subscribe(`/topic/stock/${code}`, (msg) => {
                const data = JSON.parse(msg.body);
                // 실시간 데이터 상태 업데이트
                setRtStockData(prev => ({
                    ...prev,
                    [code]: { 
                        currentPrice: Number(data.currentPrice), 
                        priceChange: Number(data.priceChange), 
                        changeRate: Number(data.changeRate) 
                    }
                }));
            });
            subRefs.current.push(sub);
        });
    }, []);

    // Flask 구독 초기화 + 새 구독
    const subscribeFlask = useCallback((list) => {
        const newCodes = list.map(item => item.stockCode).filter(code => code);
        const codesToUnsubscribe = Array.from(subscribedFlaskRef.current).filter(code => !newCodes.includes(code));
        
        // 이전 구독 해제
        unsubscribeFlask(codesToUnsubscribe);

        // 새 구독
        newCodes.forEach(code => {
            if (!subscribedFlaskRef.current.has(code)) {
                fetch("http://localhost:5000/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });
                subscribedFlaskRef.current.add(code);
            }
        });
    }, []);

    // 전체 구독 리셋 (새 종목 목록 로드 시)
    const resetSubscriptions = useCallback((list) => {
        // list는 stockCode를 가진 객체 배열
        if (!stompRef.current?.connected) return;
        subscribeStocks(list);
        subscribeFlask(list);
    }, [subscribeStocks, subscribeFlask]);


    // ============================================
    // ① 초기 키워드 로드 (원본 유지)
    // ============================================

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('http://localhost:8484/api/news/keywords/top?days=30');
                
                const formatted = response.data.map((item, index) => ({
                    rank: index + 1,
                    keyword: item.keyword,
                    keywordCount: item.keywordCount,
                    score: item.keywordCount
                }));
                
                setKeywords(formatted);
            } catch (err) {
                console.error("키워드 트렌드 로드 실패:", err);
                setError("데이터 로드에 실패했습니다. 스프링 부트 서버를 확인해주세요.");
            } finally {
                setLoading(false);
            }
        };

        fetchKeywords();
    }, []);

    // ============================================
    // ② STOMP WebSocket 연결 (마운트 시)
    // ============================================
    useEffect(() => {
        const sock = new SockJS("http://localhost:8484/ws-stock");
        const client = new Client({
            webSocketFactory: () => sock,
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            console.log("🟢 WebSocket 연결 성공");
            // 키워드 로드 후, 키워드 클릭 시 구독이 시작되므로 여기서 초기 구독은 생략
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
            // Flask 구독 해제
            unsubscribeFlask(Array.from(subscribedFlaskRef.current)); 
        };
    }, []);


    // ============================================
    // ③ 관련 종목/뉴스 로드 (키워드 변경 시)
    // ============================================

    useEffect(() => {
        if (!selectedKeyword) {
            setStocks([]);
            setNews([]);
            setShowAllStocks(false);
            // 키워드 선택 해제 시 모든 구독 해제
            resetSubscriptions([]);
            return;
        }

        const fetchRelatedData = async () => {
            try {
                setLoadingRelated(true);
                setShouldScroll(true);
                
                const [stocksRes, newsRes] = await Promise.all([
                    axios.get(`http://localhost:8484/api/news/stocks-by-keyword?keyword=${encodeURIComponent(selectedKeyword)}`),
                    axios.get(`http://localhost:8484/api/news/by-keyword?keyword=${encodeURIComponent(selectedKeyword)}`)
                ]);
                
                const stocksData = (stocksRes.data || []).map(stock => ({
                    stockCode: stock.stockCode || stock.STOCK_CODE,
                    stockName: stock.stockName || stock.STOCK_NAME,
                    marketType: stock.marketType || stock.MARKET_TYPE,
                    industry: stock.industry || stock.INDUSTRY,
                    // 기본 DB 가격을 초기값으로 사용
                    price: stock.price || stock.PRICE, 
                    priceChange: stock.priceChange || stock.PRICE_CHANGE,
                    changeRate: stock.changeRate || stock.CHANGE_RATE,
                    marketCap: stock.marketCap || stock.MARKET_CAP,
                    newsCount: stock.newsCount || stock.NEWSCOUNT || 0
                }));
                
                setStocks(stocksData);
                setNews(newsRes.data || []);

                // ⭐ 종목 리스트가 갱신되면 구독 갱신 요청
                resetSubscriptions(stocksData); 

            } catch (err) {
                console.error("관련 데이터 로드 실패:", err);
                setStocks([]);
                setNews([]);
                // 실패 시에도 구독 해제 (데이터가 없으므로)
                resetSubscriptions([]);
            } finally {
                setLoadingRelated(false);
            }
        };

        fetchRelatedData();
    }, [selectedKeyword, resetSubscriptions]);


    // ============================================
    // ④ 렌더링 준비 및 핸들러
    // ============================================

    useEffect(() => {
        if (shouldScroll && selectedKeyword && relatedSectionRef.current && !loadingRelated) {
            const timer = setTimeout(() => {
                relatedSectionRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                setShouldScroll(false);
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [shouldScroll, selectedKeyword, loadingRelated]);

    const handleKeywordClick = (keyword) => {
        setSelectedKeyword(keyword);
        setSentimentFilter('전체');
        setShowAllStocks(false);
        setRtStockData({}); // 새 키워드 선택 시 실시간 데이터 초기화
    };

    const handleSentimentFilter = (filter) => {
        setSentimentFilter(filter);
    };

    // 필터링된 뉴스 계산 및 최신순 정렬
    const filteredNews = news.filter(item => {
        if (sentimentFilter === '전체') return true;
        const sentiment = item.sentiment || item.SENTIMENT || '보통';
        return sentiment === sentimentFilter;
    }).sort((a, b) => {
        // 날짜 기준 최신순 정렬
        const dateA = a.newsDate || a.NEWS_DATE || '';
        const dateB = b.newsDate || b.NEWS_DATE || '';
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.localeCompare(dateA);
    });
    
    // 최신 뉴스 최대 10개만 표시
    const displayedNews = filteredNews.slice(0, 10);

    const maxScore = keywords.length > 0 ? Math.max(...keywords.map(k => k.score)) : 1;

    // ⭐ 실시간 데이터와 기본 데이터를 결합한 종목 리스트
    const displayedStocks = stocks.map(stock => {
        const rtData = rtStockData[stock.stockCode];
        return {
            ...stock,
            // 실시간 데이터가 있으면 그걸 쓰고, 없으면 DB 기본값을 사용
            price: rtData?.currentPrice ?? stock.price,
            priceChange: rtData?.priceChange ?? stock.priceChange,
            changeRate: rtData?.changeRate ?? stock.changeRate,
        };
    });
    
    // 최종적으로 표시할 종목 리스트 (더보기/접기 적용)
    const finalStockList = showAllStocks ? displayedStocks : displayedStocks.slice(0, 6);


    // ============================================
    // ⑤ 렌더링
    // ============================================

    return (
        <TrendContainer>
            <Title>키워드 트렌드</Title>
            <Description>
                최근 뉴스에서 많이 언급되는 키워드를 통해 시장 이슈를 파악할 수 있습니다.
            </Description>

            {error && (
                <ErrorState>
                    {error}
                </ErrorState>
            )}

            <TrendGrid>
                <KeywordSection>
                    <SectionTitle>키워드 TOP 20</SectionTitle>
                    
                    {loading ? (
                        <LoadingState>데이터를 불러오는 중...</LoadingState>
                    ) : keywords.length === 0 ? (
                        <EmptyState>
                            <p>키워드 데이터가 없습니다.</p>
                        </EmptyState>
                    ) : (
                        <KeywordList>
                            {keywords.map((item) => (
                                <KeywordItem
                                    key={item.rank}
                                    className={selectedKeyword === item.keyword ? 'active' : ''}
                                    onClick={() => handleKeywordClick(item.keyword)}
                                >
                                    <Rank>{item.rank}</Rank>
                                    <KeywordName>{item.keyword}</KeywordName>
                                    <ScoreBarContainer>
                                        <ScoreBar percentage={(item.score / maxScore) * 100} />
                                    </ScoreBarContainer>
                                    <ScoreValue>{item.keywordCount}건</ScoreValue>
                                </KeywordItem>
                            ))}
                        </KeywordList>
                    )}
                </KeywordSection>

                <RelatedSection ref={relatedSectionRef}>
                    <SectionTitle>선택한 키워드 관련 종목/뉴스</SectionTitle>
                    
                    {!selectedKeyword ? (
                        <EmptyState>
                            <p>키워드를 클릭하면 관련 종목과 뉴스를 표시합니다.</p>
                        </EmptyState>
                    ) : loadingRelated ? (
                        <LoadingState>데이터를 불러오는 중...</LoadingState>
                    ) : (
                        <>
                            {displayedStocks.length > 0 && (
                                <StockList>
                                    <StockListTitle>
                                        관련 종목 ({displayedStocks.length}개)
                                    </StockListTitle>
                                    <StockGrid>
                                        {finalStockList.map((stock, index) => {
                                            const rate = Number(stock.changeRate);
                                            return (
                                                <StockCard key={stock.stockCode || index} to={`/stock/${stock.stockCode}`}>
                                                    <StockCardHeader>
                                                        <StockCardName>{stock.stockName || '종목명 없음'}</StockCardName>
                                                        <StockCardChange 
                                                            isPositive={rate > 0}
                                                            isNegative={rate < 0}
                                                        >
                                                            {formatChangeRate(rate)}
                                                        </StockCardChange>
                                                    </StockCardHeader>
                                                    {stock.price && (
                                                        <div style={{ fontSize: '14px', color: getColor(rate), fontWeight: 600, marginTop: '8px' }}>
                                                            {formatPrice(stock.price)}원
                                                        </div>
                                                    )}
                                                    <StockCardInfo>
                                                        <StockCardMarket>
                                                            {stock.marketType === 'KOSPI' ? '코스피' : stock.marketType === 'KOSDAQ' ? '코스닥' : stock.marketType || '-'}
                                                        </StockCardMarket>
                                                        <StockCardNews>{stock.newsCount || 0}건</StockCardNews>
                                                    </StockCardInfo>
                                                </StockCard>
                                            );
                                        })}
                                    </StockGrid>
                                    {displayedStocks.length > 6 && (
                                        <ShowMoreButton
                                            showAll={showAllStocks}
                                            onClick={() => setShowAllStocks(!showAllStocks)}
                                        >
                                            {showAllStocks 
                                                ? '접기' 
                                                : `더보기 (${displayedStocks.length - 6}개)`}
                                        </ShowMoreButton>
                                    )}
                                </StockList>
                            )}

                            {news.length > 0 && (
                                <NewsList>
                                    <NewsListTitleWrapper>
                                        <NewsListTitle>
                                            최신뉴스 {displayedNews.length}개
                                        </NewsListTitle>
                                        <SentimentFilterGroup>
                                            {['전체', '긍정', '보통', '부정'].map((filter) => (
                                                <SentimentFilterButton
                                                    key={filter}
                                                    filterType={filter}
                                                    className={sentimentFilter === filter ? 'active' : ''}
                                                    onClick={() => handleSentimentFilter(filter)}
                                                >
                                                    {filter}
                                                </SentimentFilterButton>
                                            ))}
                                        </SentimentFilterGroup>
                                    </NewsListTitleWrapper>
                                    {displayedNews.length > 0 ? (
                                        displayedNews.map((item) => (
                                            <NewsItem key={item.newsId || item.NEWS_ID} sentiment={item.sentiment || item.SENTIMENT}>
                                                <NewsTitle>{item.title || item.TITLE}</NewsTitle>
                                                <NewsContent>{item.content || item.CONTENT || ''}</NewsContent>
                                                <NewsMeta>
                                                    <SentimentBadge sentiment={item.sentiment || item.SENTIMENT || '보통'}>
                                                        {item.sentiment || item.SENTIMENT || '보통'}
                                                    </SentimentBadge>
                                                    <span>{formatDate(item.newsDate || item.NEWS_DATE)}</span>
                                                    {item.keywords && (
                                                        <span>• {item.keywords.split(',').slice(0, 2).join(', ')}</span>
                                                    )}
                                                    <NewsLink href={item.url || item.URL} target="_blank" rel="noopener noreferrer">
                                                        원문 보기 →
                                                    </NewsLink>
                                                </NewsMeta>
                                            </NewsItem>
                                        ))
                                    ) : (
                                        <EmptyState>
                                            <p>선택한 감성 필터에 해당하는 뉴스가 없습니다.</p>
                                        </EmptyState>
                                    )}
                                </NewsList>
                            )}

                            {stocks.length === 0 && news.length === 0 && (
                                <EmptyState>
                                    <p>선택한 키워드와 관련된 종목이나 뉴스가 없습니다.</p>
                                </EmptyState>
                            )}
                        </>
                    )}
                </RelatedSection>
            </TrendGrid>
        </TrendContainer>
    );
}

export default KeywordTrendPage;