// src/com/boot/service/CacheInitializerService.java

package com.boot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;

@Service
public class CacheInitializerService {

    // 🌟 CacheEvictService 주입
    @Autowired
    private CacheEvictService cacheEvictService;
    
    // 서버 시작 시 (모든 Bean 초기화 후) 단 한 번 실행
    // 이 메서드는 IndexService의 @PostConstruct보다 늦게 실행될 가능성이 높습니다.
    @PostConstruct
    public void initializeCachesOnStartup() {
        System.out.println("AUTO INIT: CacheInitializerService 실행 - 캐시 강제 무효화 시작");
        try {
            // IndexService의 데이터 수집/업데이트가 완료되었다고 가정하고 캐시 삭제를 실행합니다.
            cacheEvictService.clearKospiCache();
            cacheEvictService.clearKosdaqCache();
            System.out.println("AUTO INIT: 모든 캐시 초기화 완료.");
        } catch (Exception e) {
            System.err.println("AUTO INIT: 캐시 초기화 중 오류 발생 (Redis 서버 확인 필요): " + e.getMessage());
        }
    }
}