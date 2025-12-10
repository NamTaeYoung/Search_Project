package com.boot.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.StockRealtimeHandler;

@RestController
@RequestMapping("/api/stocks")
public class StockPushController {

    @Autowired
    private StockRealtimeHandler handler;

    // 기존 Controller와 충돌 방지 위해 URL 변경
    @PostMapping("/push-realtime")
    public ResponseEntity<?> pushStock(@RequestBody Map<String, Object> body) {
        String stockCode = (String) body.get("stockCode");
        Object data = body.get("data");
        handler.pushStockData(stockCode, data);
        return ResponseEntity.ok("ok");
    }
}

