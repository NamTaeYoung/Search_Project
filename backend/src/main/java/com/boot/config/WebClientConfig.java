package com.boot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

// @Configuration 어노테이션을 사용하여 설정 클래스임을 명시합니다.
@Configuration
public class WebClientConfig {

    // WebClient.Builder를 사용하여 WebClient 빈을 생성하고 반환합니다.
    // WebClient Bean은 싱글톤으로 관리됩니다.
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                // Python 서버의 기본 URL을 설정할 수 있습니다 (선택 사항)
                .baseUrl("http://localhost:5000") 
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }
}