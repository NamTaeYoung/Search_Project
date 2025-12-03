package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockInfoDTO {
	
	private String stockCode;     // 005930 종목코드
    private String stockName;     // 삼성전자
    private String marketType;    // KOSPI / KOSDAQ
    private String industry;      // 반도체

    private Integer price;        // 현재 주가
    private Integer priceChange;  // 전일 대비 변화량
    private Double changeRate;    // 등락률(%)

    private String marketCap;     // 시가총액 (문자열 490조 등)
    private String updatedAt;     // 업데이트 시각 (String으로 매핑)
}
