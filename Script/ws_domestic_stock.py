# -*- coding: utf-8 -*-
import json
import requests
import asyncio
import websockets
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
except Exception:
    pass

FLASK_PORT = 5000
SPRING_URL = "http://localhost:8484/api/stocks/realtime"
WS_URL = "ws://ops.koreainvestment.com:31000"
MAX_SUBS = 20

# ------------------------
# 상태 관리
# ------------------------
subscribed_codes = set()        # React에서 원하는 종목
active_remote_subs = set()      # 실제 WS 서버 등록된 종목
lock = threading.Lock()

# ------------------------
# asyncio 큐 생성
# ------------------------
subscribe_queue = asyncio.Queue()
unsubscribe_queue = asyncio.Queue()

# ------------------------
# 전역 이벤트 루프 생성
# ------------------------
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# ------------------------
# Flask 앱
# ------------------------
app = Flask(__name__)
CORS(app)

@app.route("/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json(force=True, silent=True)
    if not data or "code" not in data:
        return "NO CODE", 400
    code = str(data["code"]).strip()
    if not code:
        return "NO CODE", 400

    with lock:
        if len(subscribed_codes) >= MAX_SUBS:
            return f"MAX {MAX_SUBS} SUBSCRIPTIONS", 400
        subscribed_codes.add(code)

    # 큐에 넣기 (전역 루프 사용)
    asyncio.run_coroutine_threadsafe(subscribe_queue.put(code), loop)

    print(f"✅ [구독 요청] {code} => 현재 구독 목록: {subscribed_codes}")
    return "OK", 200

@app.route("/unsubscribe", methods=["POST"])
def unsubscribe():
    data = request.get_json(force=True, silent=True)
    if not data:
        return "NO BODY", 400

    codes = data.get("codes")
    if not codes:
        codes = [data.get("code")]
    if not codes or not isinstance(codes, list):
        return "NO CODES or Invalid Format", 400

    with lock:
        for c in codes:
            c = str(c).strip()
            if c in subscribed_codes:
                subscribed_codes.discard(c)
                print(f"🧹 [구독 해제 요청] {c} (subscribed_codes에서 제거)")

    # 큐에 넣기 (전역 루프 사용)
    for c in codes:
        asyncio.run_coroutine_threadsafe(unsubscribe_queue.put(c), loop)

    print(f"=> 현재 구독 목록: {subscribed_codes}")
    return "OK", 200

@app.route("/subscriptions", methods=["GET"])
def list_subscriptions():
    with lock:
        return jsonify(sorted(list(subscribed_codes))), 200

# ------------------------
# Spring 전송
# ------------------------
def send_stock_to_spring(code, currentPrice, priceChange, changeRate):
    payload = {
        "code": code,
        "currentPrice": currentPrice,
        "priceChange": priceChange,
        "changeRate": changeRate
    }
    print(f"➡ Spring 전송: {payload}")
    headers = {"Content-Type": "application/json"}
    try:
        requests.post(SPRING_URL, headers=headers, data=json.dumps(payload), timeout=5)
    except Exception as e:
        print("❌ Spring 전송 실패:", e)

def parse_and_forward_stock_payload(packed_str):
    try:
        pValue = packed_str.split('^')
        code = pValue[0]
        currentPrice = pValue[2]
        priceChange = pValue[4]
        changeRate = pValue[5]

        with lock:
            if code not in subscribed_codes:
                return

        send_stock_to_spring(code, currentPrice, priceChange, changeRate)
    except Exception as e:
        print("❌ 파싱 에러:", e, "원본:", packed_str)

# ------------------------
# WebSocket Manager
# ------------------------
async def single_socket_manager():
    g_approval_key = "18e7b1ee-18a3-468d-b2ed-53de0b6d510a"
    custtype = "P"
    reconnect_backoff = 1

    while True:
        try:
            async with websockets.connect(WS_URL, ping_interval=None) as websocket:
                print("🔗 WebSocket 연결 성공")

                while True:
                    # Flask에서 큐로 들어온 구독/해제 요청 처리
                    while not subscribe_queue.empty():
                        code = await subscribe_queue.get()
                        with lock:
                            if code not in subscribed_codes:
                                continue
                        if code not in active_remote_subs:
                            payload = {
                                "header": {"approval_key": g_approval_key, "custtype": custtype, "tr_type": "1", "content-type": "utf-8"},
                                "body": {"input": {"tr_id": "H0STCNT0", "tr_key": code}}
                            }
                            await websocket.send(json.dumps(payload))
                            with lock:
                                active_remote_subs.add(code)
                            print(f"✅ [서버 구독 완료] {code}")

                    while not unsubscribe_queue.empty():
                        code = await unsubscribe_queue.get()
                        if code in active_remote_subs:
                            payload = {
                                "header": {"approval_key": g_approval_key, "custtype": custtype, "tr_type": "0", "content-type": "utf-8"},
                                "body": {"input": {"tr_id": "H0STCNT0", "tr_key": code}}
                            }
                            await websocket.send(json.dumps(payload))
                            with lock:
                                active_remote_subs.discard(code)
                            print(f"🛑 [서버 구독 해제 완료] {code}")

                    # WS 데이터 수신
                    try:
                        data = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                        if data and isinstance(data, bytes):
                            data = data.decode('utf-8', errors='ignore')
                        if data and data[0] == '0':
                            parts = data.split('|')
                            if len(parts) >= 4 and parts[1] == "H0STCNT0":
                                parse_and_forward_stock_payload(parts[3])
                    except asyncio.TimeoutError:
                        pass
                    except websockets.ConnectionClosed:
                        raise

        except Exception as e:
            print("❌ WebSocket 예외:", e)
            await asyncio.sleep(reconnect_backoff)
            reconnect_backoff = min(10, reconnect_backoff * 2)
        else:
            reconnect_backoff = 1

# ------------------------
# Main
# ------------------------
if __name__ == "__main__":
    # Flask 쓰레드 실행
    flask_thread = threading.Thread(
        target=lambda: app.run(host="0.0.0.0", port=FLASK_PORT, debug=False, use_reloader=False),
        daemon=True
    )
    flask_thread.start()

    # WebSocket manager 실행
    try:
        loop.run_until_complete(single_socket_manager())
    except KeyboardInterrupt:
        print("프로그램 종료")
