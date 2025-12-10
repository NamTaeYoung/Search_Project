import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useParams } from "react-router-dom";

export default function StockTest() {
  const { code } = useParams();

  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [changeRate, setChangeRate] = useState(null);

  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!code) return;

    // ✅ Spring → Python 구독 요청
    fetch(`http://localhost:8484/api/stocks/subscribe/${code}`, { method: "POST" })
      .then(() => console.log("✅ Spring 구독 요청 전송 완료:", code))
      .catch((err) => console.error("❌ Spring 구독 요청 실패:", err));

    // ✅ STOMP WebSocket 연결
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8484/ws-stock"),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log("✅ STOMP 연결 성공");

      // ✅ 기존 구독 해제
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

      // ✅ 현재 종목 새로 구독
      subscriptionRef.current = client.subscribe(
        `/topic/stock/${code}`,
        (message) => {
          const data = JSON.parse(message.body);
          console.log("📥 수신 데이터:", data);

          setCurrentPrice(data.currentPrice);
          setPriceChange(data.priceChange);
          setChangeRate(data.changeRate);
        }
      );
    };

    client.onStompError = (frame) => console.error("❌ STOMP 에러:", frame);

    client.activate();
    stompClientRef.current = client;

    // ✅ cleanup (컴포넌트 언마운트 시)
    return () => {
      console.log("🛑 STOMP 연결 해제 + Python 구독 해제:", code);

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }

      fetch(`http://localhost:8484/api/stocks/unsubscribe/${code}`, { method: "POST" }).catch(() => {});
    };
  }, [code]);

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", width: "300px" }}>
      <h3>📈 실시간 주식 [{code}]</h3>
      <p>현재가: <b>{currentPrice !== null ? currentPrice : "대기 중..."}</b></p>
      <p>전일대비: <b style={{ color: Number(priceChange) < 0 ? "blue" : "red" }}>{priceChange !== null ? priceChange : "-"}</b></p>
      <p>등락률: <b style={{ color: Number(changeRate) < 0 ? "blue" : "red" }}>{changeRate !== null ? `${changeRate}%` : "-"}</b></p>
    </div>
  );
}
