package com.carekey.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    private String id;
    private String userId;
    private String userName;
    private Role role;
    private String action;
    private String resourceType;
    private String resourceId;
    private String details;
    private String result;
    private String ipAddress;
    private Instant timestamp;
}
