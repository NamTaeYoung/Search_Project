// src/components/shared/NewsCard.jsx
import React from 'react';
import styled from 'styled-components';

const NewsItemContainer = styled.div`
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-light);
  padding: 15px 0;
  display: flex;
  justify-content: space-between;
  
  &.search-result-card {
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
    display: block;
  }
`;

const NewsTitle = styled.h3`
  font-size: 16px;
  margin: 5px 0 8px 0;
`;

const Sentiment = styled.span`
  font-size: 12px;
  font-weight: bold;
  &.positive { color: var(--red-up); }
  &.negative { color: var(--blue-down); }
`;

function NewsCard({ stockName, title, summary, date, sentiment, sentimentRate, isSearchResult = false, link = '#' }) {
  const sentimentClass = sentiment === '긍정' ? 'positive' : (sentiment === '부정' ? 'negative' : 'neutral');
  const sentimentText = sentiment && sentimentRate ? `${sentiment} ${sentimentRate}%` : '';

  return (
    <NewsItemContainer className={isSearchResult ? 'search-result-card' : ''} onClick={() => window.open(link, '_blank')}>
      <div>
        {stockName && <span>{stockName}</span>}
        <NewsTitle>{title}</NewsTitle>
        {isSearchResult && summary && <p>{summary}</p>}

        <div>
            {date && <span>{date}</span>}
            {sentiment && (
                <Sentiment className={sentimentClass}>
                    {sentimentText}
                </Sentiment>
            )}
        </div>
      </div>
      
      {isSearchResult && (
        <a href={link} target="_blank" onClick={(e) => e.stopPropagation()}>
            기사 보기
        </a>
      )}
    </NewsItemContainer>
  );
}

export default NewsCard;