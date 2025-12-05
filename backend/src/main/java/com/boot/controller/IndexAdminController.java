package com.boot.controller;

import com.boot.service.IndexService;

// 🔴 잘못된 import는 삭제하고 아래로 대체
// import org.hibernate.validator.internal.util.stereotypes.Lazy; 
import org.springframework.context.annotation.Lazy; // 🟢 Spring의 @Lazy 사용

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/index")
public class IndexAdminController {

	// 🌟 올바른 @Lazy를 사용하여 순환 참조 초기화 지연
    @Lazy
    @Autowired
    private IndexService indexService;

    @GetMapping("/init/kospi")
    public ResponseEntity<String> initKospi() {
        indexService.initiateHistoricalDataCollection();
        return ResponseEntity.ok("KOSPI init started");
    }

    @GetMapping("/init/kosdaq")
    public ResponseEntity<String> initKosdaq() {
        indexService.initiateKosdaqHistoricalDataCollection();
        return ResponseEntity.ok("KOSDAQ init started");
    }
}