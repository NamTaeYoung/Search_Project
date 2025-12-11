package com.boot.controller;

import com.boot.dao.StockDAO;
import com.boot.dto.StockInfoDTO;
import com.boot.dto.StockNewsDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/industry") // ⭐ 주소가 다릅니다!
public class IndustryController {

    @Autowired
    private StockDAO stockDAO;

    // 업종 상세 정보 조회
    @GetMapping("/{industryName}")
    public ResponseEntity<?> getIndustryInfo(@PathVariable String industryName) {
        // 1. 해당 업종 종목들 가져오기
        List<StockInfoDTO> stocks = stockDAO.getStocksByIndustry(industryName);
        
        // 2. 해당 업종 뉴스 가져오기 (키워드 검색)
        List<StockNewsDTO> newsList = stockDAO.getNewsByKeyword(industryName);

        Map<String, Object> response = new HashMap<>();
        response.put("stocks", stocks);
        response.put("news", newsList);
        
        return ResponseEntity.ok(response);
    }
}