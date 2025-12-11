package com.boot.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.dto.StockInfoDTO;

@Mapper
public interface StockInfoDAO {

    List<StockInfoDTO> searchStocks(String keyword);

    StockInfoDTO getStockDetail(String stockCode);

    List<StockInfoDTO> selectTop100MarketCapPaged(
    	    @Param("start") int start,
    	    @Param("end") int end
    	);

    
    // 🌟 급등 종목 (등락률 상위 3개)
    List<StockInfoDTO> selectTopRisingStocks();
    
    // 🌟 급락 종목 (등락률 하위 3개)
    List<StockInfoDTO> selectTopFallingStocks();
}
