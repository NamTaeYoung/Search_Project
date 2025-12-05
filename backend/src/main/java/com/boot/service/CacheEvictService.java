// src/com/boot/service/CacheEvictService.java

package com.boot.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
public class CacheEvictService {
    
    private static final String KOSPI_CACHE_NAME = "kospiHistoryCache";
    private static final String KOSDAQ_CACHE_NAME = "kosdaqHistoryCache";
    private static final String KOSPI_CACHE_KEY = "'kospi_all'";
    private static final String KOSDAQ_CACHE_KEY = "'kosdaq_all'";

    // KOSPI 캐시 삭제
    @CacheEvict(value = KOSPI_CACHE_NAME, key = KOSPI_CACHE_KEY)
    public void clearKospiCache() {
        System.out.println("KOSPI 캐시 [" + KOSPI_CACHE_NAME + "] 전체 삭제 완료.");
    }

    // KOSDAQ 캐시 삭제
    @CacheEvict(value = KOSDAQ_CACHE_NAME, key = KOSDAQ_CACHE_KEY)
    public void clearKosdaqCache() {
        System.out.println("KOSDAQ 캐시 [" + KOSDAQ_CACHE_NAME + "] 전체 삭제 완료.");
    }
}