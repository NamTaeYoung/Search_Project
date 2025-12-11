package com.boot.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.boot.dto.StockInfoDTO;
import com.boot.dto.StockNewsDTO;

@Mapper
public interface StockDAO {
    
    // 업종별 종목 리스트
    List<StockInfoDTO> getStocksByIndustry(String industry);
    
    // 키워드로 뉴스 찾기
    List<StockNewsDTO> getNewsByKeyword(String keyword);
}