package com.carekey.service;

import com.carekey.model.Patient;
import com.carekey.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QRService {

    private final PatientService patientService;
    private final AuditService auditService;

    public Optional<Patient> validateAndResolveToken(String token, String clinicianId) {
        Optional<Patient> patientOpt = patientService.findByQRToken(token);

        if (patientOpt.isPresent()) {
            Patient p = patientOpt.get();
            auditService.logEvent(
                    clinicianId,
                    "Dr. Clinician",
                    Role.CLINICIAN,
                    "QR_TOKEN_VALIDATE_SUCCESS",
                    "PATIENT_RECORD",
                    p.getId(),
                    "Resolved cryptographic QR token to patient file " + p.getName(),
                    "SUCCESS",
                    "127.0.0.1"
            );
            return Optional.of(p);
        } else {
            auditService.logEvent(
                    clinicianId,
                    "Dr. Clinician",
                    Role.CLINICIAN,
                    "QR_TOKEN_VALIDATE_FAILED",
                    "QR_TOKEN",
                    token,
                    "Invalid or expired patient QR token provided.",
                    "REJECTED_404",
                    "127.0.0.1"
            );
            return Optional.empty();
        }
    }
}
