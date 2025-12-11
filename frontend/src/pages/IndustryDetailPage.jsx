import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown, Newspaper, ListFilter } from 'lucide-react';

// ==========================================
// 1. 스타일 (Styled Components)
// ==========================================
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: "'Pretendard', sans-serif",
    color: '#333',
  },
  // --- 상단 헤더 영역 ---
  headerSection: {
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '1px solid #eee',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '15px',
    marginBottom: '20px',
  },
  industryName: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#111',
    margin: 0,
  },
  industryRate: (rate) => ({
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: rate > 0 ? '#d60000' : rate < 0 ? '#0051c7' : '#333',
  }),
  summaryText: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '25px',
  },
  // --- 대장주 TOP 3 카드 ---
  leadersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  leaderCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #eee',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
  },
  leaderBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: '#333',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  leaderName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
    display: 'block',
  },
  leaderPrice: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    marginRight: '10px',
  },
  leaderRate: (rate) => ({
    fontSize: '1rem',
    fontWeight: '600',
    color: rate > 0 ? '#d60000' : rate < 0 ? '#0051c7' : '#333',
  }),

  // --- 메인 콘텐츠 (2단 분할) ---
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr', // 좌측 2 : 우측 1 비율
    gap: '40px',
  },
  
  // 좌측: 종목 리스트
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
  },
  filterBtn: (isActive) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    border: isActive ? '1px solid #333' : '1px solid #ddd',
    background: isActive ? '#333' : '#fff',
    color: isActive ? '#fff' : '#666',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  }),
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #333',
    color: '#666',
    fontWeight: '600',
  },
  td: {
    padding: '15px 12px',
    borderBottom: '1px solid #eee',
  },
  stockLink: {
    color: '#333',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },

  // 우측: 뉴스 피드
  newsContainer: {
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '20px',
    height: 'fit-content',
    position: 'sticky',
    top: '20px', // 스크롤 시 따라오게
  },
  newsItem: {
    display: 'block',
    textDecoration: 'none',
    borderBottom: '1px solid #f0f0f0',
    padding: '15px 0',
    transition: 'opacity 0.2s',
  },
  newsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  newsMeta: {
    fontSize: '0.85rem',
    color: '#999',
    display: 'flex',
    justifyContent: 'space-between',
  },
  sentimentTag: (sentiment) => ({
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    background: sentiment === '긍정' ? '#ffebeb' : sentiment === '부정' ? '#eef4ff' : '#f5f5f5',
    color: sentiment === '긍정' ? '#d60000' : sentiment === '부정' ? '#0051c7' : '#666',
  }),
};

// ==========================================
// 2. 컴포넌트 로직
// ==========================================

function IndustryDetailPage() {
  const { industryName } = useParams(); // URL에서 업종명 가져옴 (예: 반도체)
  
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [industryStats, setIndustryStats] = useState({ avgRate: 0, leader: '' });
  
  const [sortType, setSortType] = useState('MARKET_CAP'); // 정렬 기준

  useEffect(() => {
    // 실제 API 연동
    const fetchIndustryData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/industry/${industryName}`);
        
        // 백엔드 응답 구조: { stocks: [...], news: [...] }
        const fetchedStocks = res.data.stocks || [];
        const fetchedNews = res.data.news || [];

        // 1. 업종 평균 등락률 계산
        const totalRate = fetchedStocks.reduce((acc, cur) => acc + (cur.changeRate || 0), 0);
        const avg = fetchedStocks.length > 0 ? totalRate / fetchedStocks.length : 0;

        // 2. 대장주(시총 1위) 찾기
        // 시가총액을 숫자로 변환해서 정렬 (문자열일 경우 대비)
        const sortedByCap = [...fetchedStocks].sort((a, b) => {
            const capA = Number(String(a.marketCap).replace(/,/g, '')) || 0;
            const capB = Number(String(b.marketCap).replace(/,/g, '')) || 0;
            return capB - capA;
        });
        const leaderName = sortedByCap.length > 0 ? sortedByCap[0].stockName : '-';

        setStocks(fetchedStocks);
        setNewsList(fetchedNews);
        setIndustryStats({ avgRate: avg.toFixed(2), leader: leaderName });

      } catch (error) {
        console.error("업종 데이터 로드 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustryData();
  }, [industryName]);

  // 정렬 로직 (클라이언트 사이드)
  const getSortedStocks = () => {
    let sorted = [...stocks];
    const parseCap = (val) => Number(String(val).replace(/,/g, '')) || 0;

    if (sortType === 'MARKET_CAP') {
      sorted.sort((a, b) => parseCap(b.marketCap) - parseCap(a.marketCap));
    } else if (sortType === 'RATE_DESC') {
      sorted.sort((a, b) => b.changeRate - a.changeRate);
    } else if (sortType === 'RATE_ASC') {
      sorted.sort((a, b) => a.changeRate - b.changeRate);
    }
    return sorted;
  };

  const sortedStocks = getSortedStocks();
  
  // 대장주 3개 추출 (시총 기준)
  const top3Stocks = [...stocks]
    .sort((a, b) => {
        const capA = Number(String(a.marketCap).replace(/,/g, '')) || 0;
        const capB = Number(String(b.marketCap).replace(/,/g, '')) || 0;
        return capB - capA;
    })
    .slice(0, 3);

  if (loading) return <div style={{textAlign: 'center', marginTop: '100px'}}>데이터를 불러오는 중입니다...</div>;

  return (
    <div style={styles.container}>
      
      {/* 1. 상단 헤더 및 요약 */}
      <section style={styles.headerSection}>
        <div style={styles.headerTitleRow}>
          <h1 style={styles.industryName}>{industryName}</h1>
          <span style={styles.industryRate(industryStats.avgRate)}>
            {industryStats.avgRate > 0 ? '+' : ''}{industryStats.avgRate}%
          </span>
          {industryStats.avgRate > 0 ? 
            <TrendingUp size={32} color="#d60000" /> : 
            <TrendingDown size={32} color="#0051c7" />
          }
        </div>
        <p style={styles.summaryText}>
          {industryName} 업종은 현재 <strong>{industryStats.leader}</strong> 등이 주도하고 있으며, 
          전반적인 시장 분위기는 {industryStats.avgRate > 0 ? <span style={{color:'#d60000', fontWeight:'bold'}}>강세</span> : <span style={{color:'#0051c7', fontWeight:'bold'}}>약세</span>}입니다.
        </p>

        {/* 대장주 TOP 3 카드 */}
        <div style={styles.leadersGrid}>
          {top3Stocks.map((stock, idx) => (
            <Link to={`/stock/${stock.stockCode}`} style={styles.leaderCard} key={stock.stockCode}>
              <div style={styles.leaderBadge}>시총 {idx + 1}위</div>
              <span style={styles.leaderName}>{stock.stockName}</span>
              <div style={{display:'flex', alignItems:'baseline'}}>
                <span style={styles.leaderPrice}>
                    {stock.price ? stock.price.toLocaleString() : '-'}
                </span>
                <span style={styles.leaderRate(stock.changeRate)}>
                  {stock.changeRate > 0 ? '+' : ''}{stock.changeRate}%
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. 메인 콘텐츠 (좌측: 리스트 / 우측: 뉴스) */}
      <div style={styles.contentGrid}>
        
        {/* 좌측: 종목 리스트 */}
        <div>
          <div style={styles.listHeader}>
            <div style={styles.sectionTitle}>
              <ListFilter size={24} />
              구성 종목 ({stocks.length})
            </div>
            <div style={styles.filterButtons}>
              <button style={styles.filterBtn(sortType === 'MARKET_CAP')} onClick={() => setSortType('MARKET_CAP')}>시총순</button>
              <button style={styles.filterBtn(sortType === 'RATE_DESC')} onClick={() => setSortType('RATE_DESC')}>상승순</button>
              <button style={styles.filterBtn(sortType === 'RATE_ASC')} onClick={() => setSortType('RATE_ASC')}>하락순</button>
            </div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>종목명</th>
                <th style={{...styles.th, textAlign:'right'}}>현재가</th>
                <th style={{...styles.th, textAlign:'right'}}>등락률</th>
                <th style={{...styles.th, textAlign:'right'}}>시가총액</th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map((stock) => (
                <tr key={stock.stockCode} style={{cursor:'pointer'}} onClick={() => window.location.href=`/stock/${stock.stockCode}`}>
                  <td style={styles.td}>
                    <div style={styles.stockLink}>
                      {stock.stockName}
                      <span style={{fontSize:'0.8rem', color:'#999', fontWeight:'normal'}}>{stock.stockCode}</span>
                    </div>
                  </td>
                  <td style={{...styles.td, textAlign:'right', fontWeight:'bold'}}>
                    {stock.price ? stock.price.toLocaleString() : '-'}
                  </td>
                  <td style={{...styles.td, textAlign:'right'}}>
                    <span style={styles.leaderRate(stock.changeRate)}>
                      {stock.changeRate > 0 ? '+' : ''}{stock.changeRate}%
                    </span>
                  </td>
                  <td style={{...styles.td, textAlign:'right', color:'#666'}}>
                    {/* 시가총액 포맷팅 (숫자면 억 단위 등 추가 가능, 여기선 단순 콤마) */}
                    {typeof stock.marketCap === 'number' 
                        ? (stock.marketCap / 100).toLocaleString() + '억' 
                        : stock.marketCap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 우측: 관련 뉴스 피드 */}
        <aside>
          <div style={styles.newsContainer}>
            <div style={{...styles.sectionTitle, marginBottom:'15px', fontSize:'1.2rem'}}>
              <Newspaper size={20} />
              관련 뉴스
            </div>
            
            {newsList.length === 0 ? <p style={{textAlign:'center', color:'#999'}}>관련 뉴스가 없습니다.</p> : 
                newsList.map((news) => (
                <a key={news.newsId} href={news.url} target="_blank" rel="noopener noreferrer" style={styles.newsItem}>
                    <div style={styles.newsTitle}>{news.title}</div>
                    <div style={styles.newsMeta}>
                        {/* NewsDTO의 newsDate 사용 */}
                        <span>{news.newsDate ? new Date(news.newsDate).toLocaleDateString() : ''}</span>
                        <span style={styles.sentimentTag(news.sentiment)}>{news.sentiment}</span>
                    </div>
                </a>
                ))
            }
            
            <div style={{marginTop:'15px', textAlign:'center'}}>
              <a href="#" style={{fontSize:'0.9rem', color:'#666', textDecoration:'underline'}}>뉴스 더보기</a>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default IndustryDetailPage;