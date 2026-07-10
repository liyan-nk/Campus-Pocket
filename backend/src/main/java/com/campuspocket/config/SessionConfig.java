package com.campuspocket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
public class SessionConfig {

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        boolean isProd = System.getenv("DATABASE_URL") != null;
        
        if (isProd) {
            serializer.setSameSite("None");
            serializer.setUseSecureCookie(true);
        } else {
            serializer.setSameSite("Lax");
            serializer.setUseSecureCookie(false);
        }
        serializer.setUseHttpOnlyCookie(true);
        // Align cookie name to JSESSIONID for seamless Safari cross-origin credentials integration
        serializer.setCookieName("JSESSIONID");
        return serializer;
    }
}
