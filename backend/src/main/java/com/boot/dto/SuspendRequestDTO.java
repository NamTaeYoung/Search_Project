package com.boot.dto;

import lombok.Data;

/*
 * 정지대상, 정지기간
 * */
@Data
public class SuspendRequestDTO {
    private String email;  // 정지 대상
    private int days;      // 정지 기간 (0이면 해제)
    private String reason;   // 정지 사유
}
