package com.carekey.controller;

import com.carekey.model.AuditLog;
import com.carekey.security.SecurityUtils;
import com.carekey.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/audit/my-activity")
    @PreAuthorize("hasRole('CLINICIAN')")
    public ResponseEntity<List<AuditLog>> getClinicianActivity() {
        String clinicianId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(auditService.getLogsForClinician(clinicianId));
    }

    @GetMapping(value = {"/admin/audit", "/audit/admin"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAdminAuditLogs() {
        return ResponseEntity.ok(auditService.getAllLogsForAdmin());
    }
}
