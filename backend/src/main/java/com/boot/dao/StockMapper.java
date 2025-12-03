package com.boot.dao;

import org.apache.ibatis.annotations.Mapper;

import com.boot.dto.StockInfoDTO;
import com.boot.dto.StockNewsDTO;

@Mapper
public interface StockMapper {
    void insertStockInfo(StockInfoDTO dto);
    void insertStockNews(StockNewsDTO dto);
}
