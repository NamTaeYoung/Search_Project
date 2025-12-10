package com.boot.config;

import com.boot.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    	http
	        .csrf().disable()
	        .cors().and()
	        .sessionManagement()
	            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
	        .and()
	        .authorizeHttpRequests()
	        // 구독 및 해제 요청은 인증 없이 허용 (Python과의 통신을 위한 경로)
            .antMatchers("/api/stocks/subscribe/**", "/api/stocks/unsubscribe/**").permitAll() 
            // WebSocket 연결 경로도 허용
            .antMatchers("/ws-stock/**").permitAll()
	
	        // 1. 항상 더 구체적인 URL 먼저
	        .antMatchers(HttpMethod.POST, "/auth/qr/approve").authenticated()
	
	        // 2. auth/**는 마지막에
	        .antMatchers("/auth/qr/create", "/auth/qr/status").permitAll()
	        .antMatchers("/auth/**").permitAll()
	
	        // 3. api/**는 그 뒤
	        .antMatchers("/api/**").permitAll()
	
	        // 4. admin
	        .antMatchers("/admin/**").hasRole("ADMIN")
	
	        // 5. 모든 나머지 요청 로그인 필요
	        .anyRequest().authenticated()
	        
	        
	
	        .and()
	        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
	        .formLogin().disable()
	        .httpBasic().disable();

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}