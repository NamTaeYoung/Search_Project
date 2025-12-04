package com.boot.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Bearer 토큰인지 확인
        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            // **1) 토큰 유효성 검사**
            if (jwtProvider.validateToken(token)) {

                // **2) 이메일 추출**
                String email = jwtProvider.getEmailFromToken(token);

                // **3) 기존 인증이 없다면**
                if (email != null &&
                        SecurityContextHolder.getContext().getAuthentication() == null) {

                    // DB에서 사용자 로드
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    // 인증 객체 생성
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
            // else — 토큰이 잘못된 경우 -> 아무것도 하지 않고 다음 필터
        }

        filterChain.doFilter(request, response);
    }
}
