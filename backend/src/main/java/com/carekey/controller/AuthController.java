package com.carekey.controller;

import com.carekey.dto.LoginResponse;
import com.carekey.model.Role;
import com.carekey.model.User;
import com.carekey.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String uid = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentUserRole();

        User user = User.builder()
                .uid(uid)
                .name(role == Role.ADMIN ? "Dr. Rajesh Patel (Admin)" : "Dr. Ananya Sharma (Clinician)")
                .email(role == Role.ADMIN ? "admin.patel@healthgov.in" : "dr.sharma@secureqr.health")
                .role(role != null ? role : Role.CLINICIAN)
                .organizationName(role == Role.ADMIN ? "National Health Surveillance Directorate" : "Ruby Hall Chest Clinic, Pune")
                .createdAt(Instant.now())
                .build();

        return ResponseEntity.ok(user);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        Role role = token != null && token.contains("admin") ? Role.ADMIN : Role.CLINICIAN;

        User user = User.builder()
                .uid("uid-" + role.name().toLowerCase())
                .name(role == Role.ADMIN ? "Dr. Rajesh Patel" : "Dr. Ananya Sharma")
                .role(role)
                .build();

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .user(user)
                .status("VERIFIED")
                .build());
    }
}
