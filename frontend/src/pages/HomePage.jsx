// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import axios from 'axios';

// 🔴 경로: 상위 폴더(src)로 가서 components/shared로 접근
// 실제 컴포넌트는 나중에 구현한다고 가정하고 빈 박스로 대체합니다.
// import KospiIndexCard from '../components/shared/KospiIndexCard'; 
// import NewsCard from '../components/shared/NewsCard'; 

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
  background-color: #f0f2f5; /* 전체 배경색 */
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
  grid-template-columns: repeat(3, 1fr); /* 지수 2개(Kospi/Kosdaq)와 급등/급락 종목 1개 */
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
`;

const KeywordTab = styled.button`
  background: none;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  color: ${props => (props.active ? '#3f51b5' : '#6b7280')};
  border-bottom: ${props => (props.active ? '3px solid #3f51b5' : '3px solid transparent')};
  transition: all 0.2s;
  &:hover {
    color: #3f51b5;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 뉴스는 2열로 표시 */
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
  /* 애니메이션 속도를 60초로 설정 */
  animation: ${marquee} 60s linear infinite; 
  &:hover {
    animation-play-state: paused; 
  }
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

const StockPill = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s;
  
  ${props => {
    const isPositive = props.rate && parseFloat(props.rate.replace(/%|\+/g, '')) > 0;
    const color = isPositive ? '#10b981' : '#ef4444'; 
    const bgColor = isPositive ? '#ecfdf5' : '#fef2f2'; 
    const borderColor = isPositive ? '#34d399' : '#f87171'; 

    return css`
      color: ${color};
      background-color: ${bgColor};
      border: 1px solid ${borderColor};

      &:hover {
        transform: translateY(-2px); 
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
    `;
  }}
`;

const StockName = styled.span`
  margin-right: 5px;
`;

// ----------------------------------------------------
// 🌟 유틸리티 함수
// ----------------------------------------------------

/** 등락률을 포맷합니다. (예: 1.49 -> +1.49%) */
const formatRate = (rate) => {
    if (rate === undefined || rate === null) return '-';
    const numericRate = Number(rate); 
    if (isNaN(numericRate)) return '-';
    
    const sign = numericRate > 0 ? '+' : (numericRate < 0 ? '' : '');
    return `${sign}${numericRate.toFixed(2)}%`; 
};


// --- HomePage Function ---
function HomePage() {
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
                // 🚨 스프링 부트 API 호출 경로
                const response = await axios.get('http://localhost:8484/api/stocks/top-movers');
                
                // 받아온 데이터 (Map 형태)를 상태에 저장
                setStockData({
                    rising: response.data.rising,
                    falling: response.data.falling,
                });

            } catch (error) {
                console.error("Top Movers 데이터 로드 실패:", error);
                // 실패 시 임시 데이터를 대신 사용할 수 있습니다.
                // setStockData({ rising: [...], falling: [...] });
                setStockData({ rising: [], falling: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchTopMovers();
    }, []);


    // --- 임시 데이터 (API 실패 시 마퀴만 사용하거나, 초기 로딩 시 사용) ---
    const newsData = {
        Today_Hot: [
            { title: '핵심 뉴스 1', summary: '주요 이슈에 대한 간략한 요약입니다.' },
            { title: '핵심 뉴스 2', summary: '시장에 큰 영향을 미치는 소식입니다.' },
            { title: '핵심 뉴스 3', summary: '업계 동향 관련 새로운 정보입니다.' },
            { title: '핵심 뉴스 4', summary: '경제 전문가들의 심층 분석 내용입니다.' },
        ],
        Technology: [
            { title: '기술 뉴스 1', summary: 'AI, 반도체 관련 산업 소식입니다.' },
            { title: '기술 뉴스 2', summary: '미래 산업 동향 관련 정보입니다.' },
        ],
        Economy: [
            { title: '경제 뉴스 1', summary: '금리, 환율 관련 주요 발표입니다.' },
            { title: '경제 뉴스 2', summary: '세계 경제 지표 관련 분석입니다.' },
        ],
    };
    
    const marqueeStocks = [
        { name: '삼성전자', rate: '+1.50%' },
        { name: 'SK하이닉스', rate: '+2.10%' },
        { name: '에코프로비엠', rate: '-1.23%' },
        { name: '현대차', rate: '+0.80%' },
        { name: 'LG에너지솔루션', rate: '-0.90%' },
        { name: '카카오', rate: '-1.70%' },
        { name: '네이버', rate: '+0.55%' },
        { name: '셀트리온', rate: '+3.15%' },
        { name: '포스코퓨처엠', rate: '-2.50%' },
        { name: '기아', rate: '+1.10%' },
        { name: 'HLB', rate: '+5.00%' },
        { name: '알테오젠', rate: '-3.80%' },
        { name: '금호석유', rate: '+0.10%' },
        { name: 'LG전자', rate: '-0.30%' },
        { name: '포스코DX', rate: '+4.20%' },
        { name: '두산에너빌리티', rate: '-1.90%' },
        { name: '삼성바이오로직스', rate: '+0.95%' },
        { name: 'SK이노베이션', rate: '-0.40%' },
        { name: '크래프톤', rate: '+2.70%' },
        { name: 'HMM', rate: '+1.80%' },
        { name: '대한항공', rate: '+0.05%' },
        { name: 'KT&G', rate: '-0.65%' },
        { name: 'CJ ENM', rate: '-1.15%' },
        { name: '엔씨소프트', rate: '+3.50%' },
        { name: '하나금융지주', rate: '+0.25%' },
    ];


    // Marquee 콘텐츠 렌더링 함수
    const renderMarqueeContent = () => (
        <>
            {marqueeStocks.map((stock, index) => (
                <StockPill key={index} rate={stock.rate}>
                    <StockName>{stock.name}</StockName>
                    {stock.rate}
                </StockPill>
            ))}
        </>
    );

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
                    <p>3,000.50 <span style={{ color: 'red' }}>(+0.50%)</span></p>
                    <div style={{ marginTop: '15px' }}>

[Image of a stock market index line chart]
</div>
                    <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#888' }}>**그래프 영역** (KospiIndexCard 컴포넌트 내부)</p>
                </KospiIndexCard>

                {/* Kosdaq 지수 (그래프 포함 영역) */}
                <KospiIndexCard>
                    <h3>🌐 KOSDAQ 지수</h3>
                    <p>950.75 <span style={{ color: 'blue' }}>(-0.25%)</span></p>
                    <div style={{ marginTop: '15px' }}>

[Image of a stock market index line chart]
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
                                        <strong>{stock.stockName || '정보 없음'}</strong>
                                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatRate(stock.changeRate)}</span>
                                    </li>
                                ))}
                            </StockList>

                            {/* 급락 종목 */}
                            <h4 style={{ color: '#3b82f6', marginTop: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '5px' }}>급락 종목 Top 3</h4>
                            <StockList>
                                {stockData.falling.map((stock, index) => (
                                    <li key={stock.stockCode || index}>
                                        <strong>{stock.stockName || '정보 없음'}</strong>
                                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{formatRate(stock.changeRate)}</span>
                                    </li>
                                ))}
                            </StockList>
                        </>
                    )}
                </MarketStatusCard>
            </IndexAndMarketSection>

            {/* 🌟 2.5. 움직이는 종목 마퀴 (끊김 없는 순환 구조) */}
            <StockMarqueeSection>
                <StockMarqueeContainer>
                    {/* 콘텐츠를 두 번 렌더링하고 flex: 0 0 50%로 너비를 고정하여 끊김을 방지합니다. */}
                    <MarqueeContent>{renderMarqueeContent()}</MarqueeContent>
                    <MarqueeContent>{renderMarqueeContent()}</MarqueeContent> 
                </StockMarqueeContainer>
            </StockMarqueeSection>

            {/* 3. 뉴스 및 이슈 키워드 영역 */}
            <NewsSection>
                <NewsHeader>
                    <h2>📰 오늘의 주요 이슈 및 뉴스</h2>
                    <Link to="/news" style={{ color: '#3f51b5', textDecoration: 'none', fontWeight: '600' }}>
                        더보기 &gt;
                    </Link>
                </NewsHeader>

                {/* 키워드 탭 */}
                <KeywordTabs>
                    {Object.keys(newsData).map((keyword) => (
                        <KeywordTab
                            key={keyword}
                            active={activeKeyword === keyword}
                            onClick={() => setActiveKeyword(keyword)}
                        >
                            {keyword.replace('_', ' ')}
                        </KeywordTab>
                    ))}
                </KeywordTabs>

                {/* 뉴스 리스트 (선택된 키워드에 따라) */}
                <NewsGrid>
                    {newsData[activeKeyword].map((news, index) => (
                        <NewsCard key={index}>
                            <h4 style={{ color: '#1e3a8a', marginBottom: '5px' }}>{news.title}</h4>
                            <p>{news.summary}</p>
                            <Link to={`/news/${index}`} style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '10px', display: 'block' }}>
                                뉴스 상세 보기
                            </Link>
                        </NewsCard>
                    ))}
                </NewsGrid>
            </NewsSection>
        </HomePageContainer>
    );
}

export default HomePage;