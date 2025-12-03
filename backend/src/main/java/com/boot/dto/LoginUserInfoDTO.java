package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 프론트에 내려줄 사용자 요약 정보 (민감 정보 제외)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginUserInfoDTO {

    private String email;
    private String fullName;
    private String role;       // USER / ADMIN
    private String provider;   // LOCAL / GOOGLE ...
    private String createdAt;  // 가입일
    private String accountStatus; // ACTIVE / SUSPENDED ...
}
