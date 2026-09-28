package com.carekey.config;

import com.carekey.security.FirebaseAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final FirebaseAuthenticationFilter firebaseAuthenticationFilter;

    public SecurityConfig(FirebaseAuthenticationFilter firebaseAuthenticationFilter) {
        this.firebaseAuthenticationFilter = firebaseAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\": \"401 Unauthorized\", \"message\": \"Valid Firebase ID token is required.\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"error\": \"403 Forbidden\", \"message\": \"Access denied. Role authorization failure.\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**", "/api/admin/regions", "/api/admin/conditions").permitAll()
                
                // Clinician / Doctor role-protected endpoints (PRD §11 & §12.2)
                .requestMatchers("/api/qr/**", "/api/clinician/**").hasAnyRole("CLINICIAN", "DOCTOR")
                .requestMatchers("/api/ai/clinical-summary", "/api/ai/patient-explanation").hasAnyRole("CLINICIAN", "DOCTOR")
                .requestMatchers("/api/audit/my-activity").hasAnyRole("CLINICIAN", "DOCTOR")

                // Patient role-protected endpoints
                .requestMatchers("/api/patient/**").hasRole("PATIENT")
                .requestMatchers("/api/ai/chat").hasAnyRole("PATIENT", "DOCTOR", "CLINICIAN")

                // Administrator role-protected endpoints (PRD §11 & §12.3)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/ai/admin-assistant").hasRole("ADMIN")
                .requestMatchers("/api/audit/admin").hasRole("ADMIN")

                // Any other request must be authenticated
                .anyRequest().authenticated()
            )
            .addFilterBefore(firebaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
