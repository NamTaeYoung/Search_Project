package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockNewsDTO {
	
	private Long newsId;          // 뉴스 ID (시퀀스)
    private String stockCode;     // 종목 코드 FK

    private String title;         // 뉴스 제목
    private String content;       // 뉴스 본문 (CLOB → String 맵핑)
    private String url;           // 뉴스 URL
    private String newsDate;      // 뉴스 날짜
    private String createdAt;     // 크롤링 삽입 시간

    // 감성 분석
    private String sentiment;     // 긍정 / 보통 / 부정
    private Integer score;        // 감성 점수
    private String keywords;      // 추출 키워드
    private String updatedAt;     // 감성 분석 업데이트 시간
}