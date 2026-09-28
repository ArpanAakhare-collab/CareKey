package com.carekey.controller;

import com.carekey.dto.QRValidateRequest;
import com.carekey.model.Patient;
import com.carekey.security.SecurityUtils;
import com.carekey.service.QRService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QRController {

    private final QRService qrService;

    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('CLINICIAN', 'DOCTOR')")
    public ResponseEntity<?> validateToken(@RequestBody QRValidateRequest request) {
        String clinicianId = SecurityUtils.getCurrentUserId();
        Optional<Patient> patient = qrService.validateAndResolveToken(request.getToken(), clinicianId);

        if (patient.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "patientId", patient.get().getId(),
                    "patient", patient.get()
            ));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "NOT_FOUND",
                "message", "Invalid or expired patient QR token."
        ));
    }
}
