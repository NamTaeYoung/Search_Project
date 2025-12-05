// src/components/shared/KosdaqLineChart.jsx
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

function KosdaqLineChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8484/api/chart/kosdaq-history")
      .then((res) => {
        console.log("🔥 KOSDAQ RAW DATA:", res.data);
        if (!Array.isArray(res.data)) {
          console.error("Kosdaq 응답 형식 오류:", res.data);
          return;
        }

        const mapped = res.data
          .map((item) => ({
            date: String(item.basDt), // basDt 강제 문자열 변환 ⭐
            value: Number(item.clpr), // clpr 숫자 변환
          }))
          .filter((d) => d.date && d.value); // 결측치 제거

        mapped.sort((a, b) => a.date.localeCompare(b.date)); // 날짜 정렬

        setData(mapped);
      })
      .catch((err) => console.error("KOSDAQ 데이터 로드 실패:", err));
  }, []);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip labelFormatter={dateLabelFormatter} formatter={valueFormatter} />
        <Line type="monotone" dataKey="value" stroke="#1e88e5" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default KosdaqLineChart;
