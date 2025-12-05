// src/components/shared/KospiLineChart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 날짜 포맷터
const dateLabelFormatter = (label) => {
  if (typeof label === "string" && label.length === 8) {
    return `${label.substring(0, 4)}-${label.substring(4, 6)}-${label.substring(6, 8)}`;
  }
  return label;
};

// 값 포맷터
const valueFormatter = (value) => {
  if (value === undefined || value === null) {
    return ["-", "종가"];
  }
  const formattedValue = Number(value).toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return [formattedValue, "종가"];
};

function KospiLineChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8484/api/chart/kospi-history")
      .then((res) => {
        console.log("🔥 KOSPI RAW DATA:", res.data);
        if (!Array.isArray(res.data)) {
          console.error("Kospi 응답 형식 오류:", res.data);
          return;
        }

        const mapped = res.data
          .map((item) => ({
            date: String(item.basDt), // ⭐ basDt를 무조건 문자열로 변환
            value: Number(item.clpr), // clpr 숫자로 변환
          }))
          .filter((d) => d.date && d.value); // 결측치 제거

        mapped.sort((a, b) => a.date.localeCompare(b.date)); // 날짜 정렬

        setData(mapped);
      })
      .catch((err) => console.error("KOSPI 데이터 로드 실패:", err));
  }, []);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip labelFormatter={dateLabelFormatter} formatter={valueFormatter} />
        <Line type="monotone" dataKey="value" stroke="#3f51b5" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default KospiLineChart;
