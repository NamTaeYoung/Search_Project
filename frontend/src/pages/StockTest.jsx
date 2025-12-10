import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client"; // ✅ 추가
import { useParams } from "react-router-dom";

export default function StockTest() {
  const { code } = useParams();
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8484/ws-stock"), // ✅ 이제 SockJS 사용
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/stock/${code}`, (message) => {
        const data = JSON.parse(message.body);
        setPrice(data.currentPrice);
      });
    };

    client.activate();
    return () => client.deactivate();
  }, [code]);

  return (
    <div>
      <h3>실시간 주식가격 [{code}]</h3>
      <p>{price ?? "데이터 대기 중..."}</p>
    </div>
  );
}
