package com.carekey.service;

import com.carekey.model.AuditLog;
import com.carekey.model.Role;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final List<AuditLog> auditLogs = new ArrayList<>();

    public AuditService() {
        // Seed initial audit trail
        logEvent("clinician-dr-sharma-01", "Dr. Ananya Sharma", Role.CLINICIAN, "SYSTEM_INIT", "AUDIT_SERVICE", "system", "Audit subsystem online", "SUCCESS", "127.0.0.1");
    }

    public synchronized AuditLog logEvent(String userId, String userName, Role role, String action,
                                          String resourceType, String resourceId, String details,
                                          String result, String ipAddress) {
        AuditLog entry = AuditLog.builder()
                .id("log-" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId != null ? userId : "anonymous")
                .userName(userName != null ? userName : "Dr. Medical Officer")
                .role(role != null ? role : Role.CLINICIAN)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .result(result)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .timestamp(Instant.now())
                .build();

        auditLogs.add(0, entry);
        return entry;
    }

    public synchronized List<AuditLog> getLogsForClinician(String userId) {
        return auditLogs.stream()
                .filter(l -> l.getRole() == Role.CLINICIAN)
                .collect(Collectors.toList());
    }

    public synchronized List<AuditLog> getAllLogsForAdmin() {
        return new ArrayList<>(auditLogs);
    }
}
