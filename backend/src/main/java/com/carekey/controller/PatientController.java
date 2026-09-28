package com.carekey.controller;

import com.carekey.model.Patient;
import com.carekey.security.SecurityUtils;
import com.carekey.service.AuditService;
import com.carekey.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final AuditService auditService;

    @GetMapping("/profile")
    public ResponseEntity<?> getOwnProfile() {
        String patientUid = SecurityUtils.getCurrentUserId();
        Optional<Patient> patient = patientService.getPatientByOwnerUid(patientUid);

        if (patient.isPresent()) {
            return ResponseEntity.ok(patient.get());
        }

        // Fallback default
        return ResponseEntity.ok(Map.of(
                "uid", patientUid,
                "profileCompleted", false,
                "message", "Profile not yet completed. Please submit profile details."
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateOwnProfile(@RequestBody Patient profileData) {
        String patientUid = SecurityUtils.getCurrentUserId();
        
        // Security check: Never trust incoming client ID; derive from verified token
        Optional<Patient> updated = patientService.updatePatientProfile(patientUid, profileData);

        if (updated.isPresent()) {
            return ResponseEntity.ok(updated.get());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to update patient profile.");
    }

    @GetMapping("/profile/status")
    public ResponseEntity<?> getProfileStatus() {
        String patientUid = SecurityUtils.getCurrentUserId();
        Optional<Patient> patient = patientService.getPatientByOwnerUid(patientUid);

        boolean completed = patient.map(Patient::isProfileCompleted).orElse(false);

        return ResponseEntity.ok(Map.of(
                "uid", patientUid,
                "profileCompleted", completed
        ));
    }
}
