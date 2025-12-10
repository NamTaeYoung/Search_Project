# -*- coding: utf-8 -*-
import json
import requests
import asyncio
import websockets
import threading
from flask import Flask, request, jsonify

try:
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
except Exception:
    pass

FLASK_PORT = 5000
SPRING_URL = "http://localhost:8484/api/stocks/realtime"
WS_URL = "ws://ops.koreainvestment.com:31000"

subscribed_codes = set()   # Flask 요청으로 추가된 코드
active_remote_subs = set() # 실제 서버에 등록된 종목
lock = threading.Lock()    # 동기화

app = Flask(__name__)

@app.route("/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json(force=True, silent=True)
    if not data or "code" not in data:
        return "NO CODE", 400

    code = str(data["code"]).strip()
    if not code:
        return "NO CODE", 400

    with lock:
        subscribed_codes.add(code)

    print(f"✅ [구독 추가] {code}  => 현재 구독: {subscribed_codes}")
    return "OK", 200

@app.route("/unsubscribe", methods=["POST"])
def unsubscribe():
    data = request.get_json(force=True, silent=True)
    if not data:
        return "NO BODY", 400

    codes = data.get("codes") or [data.get("code")]
    if not codes:
        return "NO CODES", 400

    if isinstance(codes, str):
        codes = [codes]

    with lock:
        for c in codes:
            subscribed_codes.discard(str(c).strip())

    print(f"🧹 [구독 해제] {codes}  => 현재 구독: {subscribed_codes}")
    return "OK", 200

@app.route("/subscriptions", methods=["GET"])
def list_subscriptions():
    with lock:
        return jsonify(sorted(list(subscribed_codes))), 200

def run_flask():
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=False, use_reloader=False)

def send_stock_to_spring(code, currentPrice, priceChange, changeRate):
    payload = {
        "code": code,
        "currentPrice": currentPrice,
        "priceChange": priceChange,
        "changeRate": changeRate
    }
    headers = {"Content-Type": "application/json"}
    try:
        requests.post(SPRING_URL, headers=headers, data=json.dumps(payload), timeout=5)
        print("➡ Spring 전송:", payload)
    except Exception as e:
        print("❌ Spring 전송 실패:", e)

def parse_and_forward_stock_payload(packed_str):
    try:
        pValue = packed_str.split('^')
        code = pValue[0]
        with lock:
            if code not in subscribed_codes:
                print(f"⛔ 구독 취소된 종목 무시: {code}")
                return

        currentPrice = pValue[2]
        priceChange = pValue[4]
        changeRate = pValue[5]
        send_stock_to_spring(code, currentPrice, priceChange, changeRate)
    except Exception as e:
        print("❌ 파싱 에러:", e, "원본:", packed_str)

async def single_socket_manager():
    g_approval_key = "0290cbb2-819d-47ad-98d2-4cf5d1f42a11"
    custtype = "P"
    reconnect_backoff = 1

    while True:
        try:
            async with websockets.connect(WS_URL, ping_interval=None) as websocket:
                with lock:
                    local_snapshot = set(subscribed_codes)
                for code in local_snapshot:
                    payload = {
                        "header": {"approval_key": g_approval_key, "custtype": custtype, "tr_type": "1", "content-type": "utf-8"},
                        "body": {"input": {"tr_id": "H0STCNT0", "tr_key": code}}
                    }
                    await websocket.send(json.dumps(payload))
                    active_remote_subs.add(code)
                    print("✅ 서버 구독 등록 (초기):", code)

                while True:
                    with lock:
                        wanted = set(subscribed_codes)

                    for code in wanted - active_remote_subs:
                        payload = {
                            "header": {"approval_key": g_approval_key, "custtype": custtype, "tr_type": "1", "content-type": "utf-8"},
                            "body": {"input": {"tr_id": "H0STCNT0", "tr_key": code}}
                        }
                        await websocket.send(json.dumps(payload))
                        active_remote_subs.add(code)
                        print("✅ 서버 구독 등록 (추가):", code)

                    try:
                        data = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    except asyncio.TimeoutError:
                        data = None
                    except websockets.ConnectionClosed:
                        raise

                    if data:
                        if isinstance(data, bytes):
                            data = data.decode('utf-8', errors='ignore')
                        if data and data[0] == '0':
                            parts = data.split('|')
                            if len(parts) >= 4 and parts[1] == "H0STCNT0":
                                parse_and_forward_stock_payload(parts[3])

                    with lock:
                        removed = active_remote_subs - subscribed_codes
                    for code in removed:
                        active_remote_subs.discard(code)
                        print("🧹 로컬 구독 해제 처리 (중지):", code)

        except Exception as e:
            print("❌ 단일 소켓 매니저 예외:", e)
            await asyncio.sleep(reconnect_backoff)
            reconnect_backoff = min(10, reconnect_backoff * 2)
        else:
            reconnect_backoff = 1

if __name__ == "__main__":
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()

    try:
        asyncio.run(single_socket_manager())
    except KeyboardInterrupt:
        print("프로그램 종료 (KeyboardInterrupt)")
