package com.boot.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import com.boot.StockRealtimeHandler;
import com.boot.dto.StockDetailResponseDTO;
import com.boot.dto.StockInfoDTO;
import com.boot.dto.StockNewsDTO;
import com.boot.service.StockInfoService;
import com.boot.service.StockNewsService;
import com.boot.service.StockService;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
//@RequestMapping("/api")    
@RequiredArgsConstructor
/*
 * 검색 + 상세
 * */
@CrossOrigin(origins = "http://localhost:5173")
public class StockController {

    private final StockInfoService stockInfoService;
    private final StockNewsService stockNewsService;
    private final StockService stockService;

    // 자동완성 + 검색
    @GetMapping("/search")
    public List<StockInfoDTO> search(@RequestParam String keyword) {
        return stockInfoService.searchStocks(keyword);
    }

    // 상세보기
    @GetMapping("/{stockCode}")
    public StockDetailResponseDTO getDetail(@PathVariable String stockCode) {

        StockDetailResponseDTO dto = new StockDetailResponseDTO();

        dto.setStockInfo(stockInfoService.getStockDetail(stockCode));
        dto.setNewsList(stockNewsService.getNewsByStock(stockCode));
        dto.setSentiment(stockNewsService.getSentimentSummary(stockCode));

        return dto;
    }
    @PostMapping
    public String insertStockInfo(@RequestBody StockInfoDTO dto) {

        System.out.println("==== [CHECK] 들어온 STOCK_NAME ====");
        System.out.println(dto.getStockName());
        System.out.println("=================================");

        stockService.insertStockInfo(dto);
        return "OK";
    }


    @PostMapping("/news")
    public String insertStockNews(@RequestBody StockNewsDTO dto) {
    	stockService.insertStockNews(dto);
        return "OK";
    }
    // 시가총액 순위 조회 엔드포인트 추가
    @GetMapping("/marketcap") // 최종 경로: /api/stocks/marketcap
    public ResponseEntity<List<StockInfoDTO>> getMarketCapRanking() {
        
        // StockService의 메서드를 호출
        List<StockInfoDTO> ranking = stockService.selectTop100MarketCap(); 
        
        return ResponseEntity.ok(ranking);
    }
    
    // 🌟 급등/급락 종목 조회 API
    //테스트용 주석
    @GetMapping("/top-movers")
    public Map<String, List<StockInfoDTO>> getTopMovers() {
        
        List<StockInfoDTO> rising = stockService.selectTopRisingStocks();
        List<StockInfoDTO> falling = stockService.selectTopFallingStocks();
        
        Map<String, List<StockInfoDTO>> movers = new HashMap<>();
        movers.put("rising", rising);
        movers.put("falling", falling);
        
        return movers;
    }
    
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    @Qualifier("myRestTemplate")
    private RestTemplate restTemplate;

    @Autowired
    private WebClient webClient; // ✅ WebClient 주입

    @PostMapping("/realtime")
    public void receiveStock(@RequestBody StockData stockData) {
        // React에 브로드캐스트
        messagingTemplate.convertAndSend("/topic/stock/" + stockData.code, stockData);
    }

    public static class StockData {
        public String code;          // 종목코드
        public String currentPrice;  // 현재가
        public String priceChange;   // 전일대비
        public String changeRate;    // 등락률
    }

    @PostMapping("/subscribe/{code}")
    public ResponseEntity<Void> subscribe(@PathVariable String code) {

        String pythonUrl = "http://localhost:5000/subscribe";

        Map<String, String> body = new HashMap<>();
        body.put("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        // 구독은 RestTemplate (동기) 사용
        restTemplate.postForObject(pythonUrl, entity, String.class);
//        System.out.println("Python Unsubscribe 요청 성공: " + code);

        return ResponseEntity.ok().build();
    }


    @PostMapping("/unsubscribe/{code}")
    public ResponseEntity<Void> unsubscribe(@PathVariable String code) {

        String pythonUrl = "/unsubscribe"; // WebClient의 baseUrl을 사용하도록 Path만 남깁니다.

        Map<String, String> body = new HashMap<>();
        body.put("code", code);

        // WebClient를 사용하여 비동기적으로 요청을 보내고 결과를 기다리지 않습니다.
        // 이는 React의 sendBeacon 요청이 끊겨도 백그라운드에서 요청을 완료하도록 보장합니다.
        webClient.post()
            .uri(pythonUrl)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .toBodilessEntity()
            .subscribe(
                success -> System.out.println("Python Unsubscribe 요청 성공: " + code),
                error -> System.err.println("Python Unsubscribe 요청 실패: " + code + ", 에러: " + error.getMessage())
            );
        
        // 클라이언트에게는 즉시 응답을 보냅니다.
        return ResponseEntity.ok().build();
    }


}
