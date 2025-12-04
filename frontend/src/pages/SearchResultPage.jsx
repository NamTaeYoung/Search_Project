import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';

const Container = styled.div`
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const StockItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: white;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    border-color: var(--primary-blue, #007bff);
  }
`;

const StockInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Code = styled.span`
  font-size: 12px;
  color: #888;
`;

const Name = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const Price = styled.div`
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  
  /* 상승이면 빨강, 하락이면 파랑 (나중에 데이터에 따라 색상 변경 가능) */
  color: #d60000; 
`;

function SearchResultPage() {
  // 1. URL에서 검색어(?keyword=삼성전자) 꺼내기
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  const [stocks, setStocks] = useState([]); // 검색 결과 담을 곳
  const [loading, setLoading] = useState(true);

  // 2. 화면이 켜지면(또는 키워드가 바뀌면) 백엔드에 데이터 요청
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        // 여기서 백엔드(/api/...)로 요청을 보냅니다!
        const response = await axios.get(`/api/stocks/search?keyword=${keyword}`);
        setStocks(response.data); // 받아온 JSON을 변수에 저장
      } catch (error) {
        console.error("검색 실패", error);
        alert("검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (keyword) {
      fetchStocks();
    }
  }, [keyword]);

  return (
    <Container>
      <Title>'{keyword}' 검색 결과</Title>

      {loading ? (
        <p>검색 중...</p>
      ) : stocks.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        // 3. 받아온 리스트(JSON)를 화면에 뿌리기
        stocks.map((stock) => (
          <Link to={`/stock/${stock.stockCode}`} key={stock.stockCode} style={{textDecoration: 'none'}}>
            <StockItem>
              <StockInfo>
                <Name>{stock.stockName}</Name>
                <Code>{stock.marketType} | {stock.stockCode}</Code>
              </StockInfo>
              <Price>
                {stock.price.toLocaleString()}원 
                <span style={{fontSize: '12px', marginLeft: '5px'}}>
                   ({stock.changeRate}%)
                </span>
              </Price>
            </StockItem>
          </Link>
        ))
      )}
    </Container>
  );
}

export default SearchResultPage;