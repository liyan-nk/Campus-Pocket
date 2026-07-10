package com.campuspocket.config;

import org.apache.tomcat.util.http.Rfc6265CookieProcessor;
import org.apache.tomcat.util.http.SameSiteCookies;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SessionConfig {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> cookieProcessorCustomizer() {
        return serverFactory -> {
            boolean isProd = System.getenv("DATABASE_URL") != null;
            serverFactory.addContextCustomizers(context -> {
                Rfc6265CookieProcessor processor = new Rfc6265CookieProcessor();
                if (isProd) {
                    processor.setSameSiteCookies(SameSiteCookies.NONE.getValue());
                } else {
                    processor.setSameSiteCookies(SameSiteCookies.LAX.getValue());
                }
                context.setCookieProcessor(processor);
            });
            if (isProd) {
                serverFactory.getSession().getCookie().setSecure(true);
            }
            serverFactory.getSession().getCookie().setHttpOnly(true);
        };
    }
}
