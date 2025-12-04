// src/components/shared/KospiIndexCard.jsx
import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 20px 25px;
  margin-bottom: 20px;
  min-width: 250px;
`;

const IndexValue = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ChangeInfo = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  &.up { color: var(--red-up); }
  &.down { color: var(--blue-down); }
`;

function KospiIndexCard({ indexData }) {
  const { value, change, percent } = indexData;
  const isUp = change > 0;
  const changeClass = isUp ? 'up' : (change < 0 ? 'down' : 'even');
  const changePrefix = isUp ? '+' : '';

  return (
    <Card>
      <p className="title">오늘의 KOSPI 지수</p>
      <IndexValue>{value}</IndexValue>
      <ChangeInfo className={changeClass}>
        {changePrefix}{change} ({changePrefix}{percent})
      </ChangeInfo>
      <small>실시간 코스피 데이터</small>
    </Card>
  );
}

export default KospiIndexCard;