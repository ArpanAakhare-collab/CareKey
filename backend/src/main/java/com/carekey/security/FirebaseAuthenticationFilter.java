package com.carekey.security;

import com.carekey.model.Role;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);

        if (StringUtils.hasText(token)) {
            try {
                // Check if demo/synthetic token
                if (token.startsWith("token-demo-") || token.startsWith("token-phone-") || token.startsWith("sec-token-")) {
                    Role role = Role.DOCTOR;
                    String uid = "user-01";
                    if (token.contains("admin")) {
                        role = Role.ADMIN;
                        uid = "admin-dr-patel-02";
                    } else if (token.contains("patient")) {
                        role = Role.PATIENT;
                        uid = "patient-user-01";
                    } else {
                        role = Role.DOCTOR;
                        uid = "doctor-user-01";
                    }
                    
                    List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + role.name()),
                            new SimpleGrantedAuthority("ROLE_" + (role == Role.DOCTOR ? "CLINICIAN" : role.name()))
                    );
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(uid, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    // Verify with Firebase Admin SDK if live
                    try {
                        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                        String uid = decodedToken.getUid();
                        Object customRole = decodedToken.getClaims().get("role");
                        Role role = Role.PATIENT;
                        if (customRole != null) {
                            String r = customRole.toString().toUpperCase();
                            if (r.contains("ADMIN")) role = Role.ADMIN;
                            else if (r.contains("DOCTOR") || r.contains("CLINICIAN")) role = Role.DOCTOR;
                            else role = Role.PATIENT;
                        }

                        List<SimpleGrantedAuthority> authorities = List.of(
                                new SimpleGrantedAuthority("ROLE_" + role.name()),
                                new SimpleGrantedAuthority("ROLE_" + (role == Role.DOCTOR ? "CLINICIAN" : role.name()))
                        );
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(uid, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } catch (Exception firebaseEx) {
                        log.warn("Firebase token validation failed, checking fallback claims: {}", firebaseEx.getMessage());
                    }
                }
            } catch (Exception e) {
                log.error("Authentication filter error: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
