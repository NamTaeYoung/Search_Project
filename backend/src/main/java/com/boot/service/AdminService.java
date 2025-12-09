package com.boot.service;

import com.boot.dao.AdminDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminDAO adminDAO;

    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(adminDAO.getUsers());
    }

    public ResponseEntity<?> suspendUser(String email, int days) {
        LocalDateTime until = LocalDateTime.now().plusDays(days);
        adminDAO.suspendUser(email, until);
        adminDAO.insertAdminLog("SUSPEND", email, "정지 " + days + "일");
        return ResponseEntity.ok("사용자 정지 완료");
    }

    public ResponseEntity<?> unsuspendUser(String email) {
        adminDAO.unsuspendUser(email);
        adminDAO.insertAdminLog("UNSUSPEND", email, "정지 해제");
        return ResponseEntity.ok("정지 해제 완료");
    }

    public ResponseEntity<?> changeRole(String email, String role) {
        adminDAO.changeRole(email, role);
        adminDAO.insertAdminLog("ROLE_CHANGE", email, "권한 변경: " + role);
        return ResponseEntity.ok("권한 변경 완료");
    }

    public ResponseEntity<?> resetFail(String email) {
        adminDAO.resetFail(email);
        adminDAO.insertAdminLog("RESET_FAIL", email, "로그인 실패 횟수 초기화");
        return ResponseEntity.ok("초기화 완료");
    }

    public ResponseEntity<?> forceLogout(String email) {
        adminDAO.forceLogout(email);
        adminDAO.insertAdminLog("FORCE_LOGOUT", email, "강제 로그아웃");
        return ResponseEntity.ok("로그아웃 완료");
    }

    public ResponseEntity<?> getTokens() {
        return ResponseEntity.ok(adminDAO.getTokens());
    }

    public ResponseEntity<?> deleteToken(String email) {
        adminDAO.forceLogout(email);
        adminDAO.insertAdminLog("DELETE_TOKEN", email, "토큰 삭제");
        return ResponseEntity.ok("토큰 삭제 완료");
    }

    public ResponseEntity<?> clearTokens() {
        adminDAO.clearTokens();
        adminDAO.insertAdminLog("CLEAR_TOKEN_ALL", null, "전체 토큰 초기화");
        return ResponseEntity.ok("전체 초기화 완료");
    }

    public ResponseEntity<?> getLoginLog() {
        return ResponseEntity.ok(adminDAO.getLoginLog());
    }

    public ResponseEntity<?> getAdminLog() {
        return ResponseEntity.ok(adminDAO.getAdminLog());
    }

    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok(adminDAO.getDashboard());
    }
}
