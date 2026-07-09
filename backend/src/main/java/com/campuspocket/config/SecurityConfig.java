package com.campuspocket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Disabled for API convenience, session protected via HTTP-only Strict cookie
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/student/activate",
                    "/api/auth/student/login",
                    "/api/auth/admin/login",
                    "/api/auth/status"
                ).permitAll()
                .requestMatchers("/h2-console/**").permitAll() // Dev database console
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable())); // Required for H2 Console
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        List<String> allowedOriginPatterns = new ArrayList<>(Arrays.asList(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://*.vercel.app"
        ));
        
        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl != null && !frontendUrl.trim().isEmpty()) {
            allowedOriginPatterns.add(frontendUrl.trim());
        }

        configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "Accept"));
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
