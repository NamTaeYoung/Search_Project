package com.boot.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.boot.dto.StockNewsDTO;
import com.boot.dto.SentimentSummaryDTO;
import com.boot.service.StockNewsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StockNewsController {

    private final StockNewsService stockNewsService;

    // ================================
    // 1) 종목별 뉴스 리스트
    // ================================
    @GetMapping("/{stockCode}")
    public List<StockNewsDTO> getNews(@PathVariable String stockCode) {
        return stockNewsService.getNewsByStock(stockCode);
    }

    // ================================
    // 2) 종목별 감성 요약 (기본 요약)
    // ================================
    @GetMapping("/{stockCode}/sentiment")
    public SentimentSummaryDTO getSentimentSummary(@PathVariable String stockCode) {
        return stockNewsService.getSentimentSummary(stockCode);
    }

    // ================================
    // 3) 종목별 감성 통계 (상세)
    // ================================
    @GetMapping("/{stockCode}/sentiment/detail")
    public SentimentSummaryDTO getSentimentSummaryByStock(@PathVariable String stockCode) {
        return stockNewsService.getSentimentSummaryByStock(stockCode);
    }

    // ================================
    // 4) 종목별 감성 통계 (기간 필터링)
    //    예: /api/news/005930/sentiment/period?days=30
    // ================================
    @GetMapping("/{stockCode}/sentiment/period")
    public SentimentSummaryDTO getSentimentSummaryWithPeriod(
            @PathVariable String stockCode,
            @RequestParam(defaultValue = "30") int days) {

        return stockNewsService.getSentimentSummaryByStockWithPeriod(stockCode, days);
    }

    // ================================
    // 5) 전체 종목별 감성 통계 (기간 X, 전체)
    //    예: /api/news/sentiment/all
    // ================================
    @GetMapping("/sentiment/all")
    public List<Map<String, Object>> getAllStockSentimentSummary() {
        return stockNewsService.getAllStockSentimentSummary();
    }

    // ================================
    // 6) 전체 종목별 감성 통계 (기간 필터링)
    //    예: /api/news/sentiment/all/period?days=30
    // ================================
    @GetMapping("/sentiment/all/period")
    public List<Map<String, Object>> getAllStockSentimentSummaryWithPeriod(
            @RequestParam(defaultValue = "30") int days) {

        return stockNewsService.getAllStockSentimentSummaryWithPeriod(days);
    }

    // ================================
    // 6-1) 감성 대시보드용 엔드포인트
    //      프론트에서 사용하는 URL:
    //      /api/news/sentiment/dashboard?days=30
    //      내부적으로는 위 6번 메서드와 동일 로직 사용
    // ================================
    @GetMapping("/sentiment/dashboard")
    public List<Map<String, Object>> getDashboardSentimentSummary(
            @RequestParam(defaultValue = "30") int days) {

        return stockNewsService.getAllStockSentimentSummaryWithPeriod(days);
    }

    // ================================
    // 7) 종목별 날짜별 감성 트렌드
    //    예: /api/news/005930/sentiment/trend?days=30
    // ================================
    @GetMapping("/{stockCode}/sentiment/trend")
    public List<Map<String, Object>> getSentimentTrend(
            @PathVariable String stockCode,
            @RequestParam(defaultValue = "30") int days) {

        return stockNewsService.getSentimentTrendByStock(stockCode, days);
    }

    // ================================
    // 8) 키워드 TOP 10 (특정 종목)
    // ================================
    @GetMapping("/{stockCode}/keywords")
    public List<Map<String, Object>> getTopKeywordsByStock(@PathVariable String stockCode) {
        return stockNewsService.getTopKeywordsByStock(stockCode);
    }

    // ================================
    // 9) 전체 키워드 TOP 20 (트렌드)
    // ================================
    @GetMapping("/keywords/top")
    public List<Map<String, Object>> getTopKeywordsAll(
            @RequestParam(defaultValue = "30") int days) {

        return stockNewsService.getTopKeywordsAll(days);
    }

    // ================================
    // 10) 전체 감성 통계 (전체 기사 기준)
    // ================================
    @GetMapping("/sentiment/overall")
    public Map<String, Object> getOverallSentimentSummary() {
        return stockNewsService.getOverallSentimentSummary();
    }
    
 // ✅ 산업 목록 (중복 제거)
    @GetMapping("/industries")
    public List<String> getIndustries() {
        return stockNewsService.getIndustries();
    }

    // ✅ 산업별 뉴스 조회
    @GetMapping("/by-industry")
    public List<StockNewsDTO> getNewsByIndustry(@RequestParam String industry) {
        return stockNewsService.getNewsByIndustry(industry);
    }

}
