//package com.boot.cache;
//
//
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.cache.annotation.CacheEvict;
//import org.springframework.cache.annotation.Cacheable;
//import org.springframework.stereotype.Component;
//
//import java.util.List;
//import java.util.function.Supplier;
//
//@Component
//@Slf4j
//public class CacheEvictHelper {
//
//    public static final String KOSPI_CACHE = "kospiHistoryCache";
//    public static final String KOSDAQ_CACHE = "kosdaqHistoryCache";
//    private static final String KOSPI_KEY = "'kospi_all'";
//    private static final String KOSDAQ_KEY = "'kosdaq_all'";
//
//    @Cacheable(value = KOSPI_CACHE, key = KOSPI_KEY)
//    public List<?> getKospiTimeSeriesData(Supplier<List<?>> loader) {
//        log.info("KOSPI Cache Miss → DB 조회");
//        return loader.get();
//    }
//
//    @Cacheable(value = KOSDAQ_CACHE, key = KOSDAQ_KEY)
//    public List<?> getKosdaqTimeSeriesData(Supplier<List<?>> loader) {
//        log.info("KOSDAQ Cache Miss → DB 조회");
//        return loader.get();
//    }
//
//    @CacheEvict(value = KOSPI_CACHE, key = KOSPI_KEY, allEntries = true)
//    public void clearKospiCache() {
//        log.info("🔥 KOSPI 캐시 삭제 완료");
//    }
//
//    @CacheEvict(value = KOSDAQ_CACHE, key = KOSDAQ_KEY, allEntries = true)
//    public void clearKosdaqCache() {
//        log.info("🔥 KOSDAQ 캐시 삭제 완료");
//    }
//}
