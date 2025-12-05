// src/com/boot/controller/CacheAdminController.java

package com.boot.controller;

import com.boot.service.CacheEvictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/cache")
public class CacheAdminController {

    @Autowired
    private CacheEvictService cacheEvictService;

    // POST 요청을 통해 KOSPI/KOSDAQ 캐시 전체를 강제로 삭제합니다.
    @PostMapping("/clear-all")
    public ResponseEntity<String> clearAllCaches() {
        try {
            cacheEvictService.clearKospiCache();
            cacheEvictService.clearKosdaqCache();
            return ResponseEntity.ok("All Index Caches Cleared Successfully.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Cache Clear Failed: " + e.getMessage());
        }
    }
}