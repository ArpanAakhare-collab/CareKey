package com.carekey.controller;

import com.carekey.model.Patient;
import com.carekey.model.Prescription;
import com.carekey.model.Role;
import com.carekey.model.Visit;
import com.carekey.security.SecurityUtils;
import com.carekey.service.AuditService;
import com.carekey.service.PatientService;
import com.carekey.service.PrescriptionService;
import com.carekey.service.VisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clinician")
@PreAuthorize("hasAnyRole('CLINICIAN', 'DOCTOR')")
@RequiredArgsConstructor
public class ClinicianController {

    private final PatientService patientService;
    private final VisitService visitService;
    private final PrescriptionService prescriptionService;
    private final AuditService auditService;

    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable String id) {
        String clinicianId = SecurityUtils.getCurrentUserId();
        Optional<Patient> patient = patientService.getPatientById(id);

        if (patient.isPresent()) {
            auditService.logEvent(
                    clinicianId,
                    "Dr. Clinician",
                    Role.CLINICIAN,
                    "PATIENT_RECORD_ACCESSED",
                    "PATIENT_RECORD",
                    id,
                    "Authorized clinician viewed profile for " + patient.get().getName(),
                    "SUCCESS",
                    "127.0.0.1"
            );
            return ResponseEntity.ok(patient.get());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Patient not found");
    }

    @GetMapping("/patients/{id}/visits")
    public ResponseEntity<List<Visit>> getPatientVisits(@PathVariable String id) {
        return ResponseEntity.ok(visitService.getVisitsForPatient(id));
    }

    @PostMapping("/patients/{id}/visits")
    public ResponseEntity<Visit> addVisit(@PathVariable String id, @RequestBody Visit visit) {
        String clinicianId = SecurityUtils.getCurrentUserId();
        visit.setPatientId(id);
        visit.setClinicianId(clinicianId);
        Visit created = visitService.addVisit(visit);

        auditService.logEvent(
                clinicianId,
                "Dr. Clinician",
                Role.CLINICIAN,
                "VISIT_CREATED",
                "VISIT_RECORD",
                created.getId(),
                "Added new clinical encounter for patient " + id,
                "SUCCESS",
                "127.0.0.1"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patients/{id}/prescriptions")
    public ResponseEntity<List<Prescription>> getPatientPrescriptions(@PathVariable String id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsForPatient(id));
    }

    @PostMapping("/patients/{id}/prescriptions")
    public ResponseEntity<Prescription> addPrescription(@PathVariable String id, @RequestBody Prescription prescription) {
        String clinicianId = SecurityUtils.getCurrentUserId();
        prescription.setPatientId(id);
        prescription.setClinicianId(clinicianId);
        Prescription created = prescriptionService.addPrescription(prescription);

        auditService.logEvent(
                clinicianId,
                "Dr. Clinician",
                Role.CLINICIAN,
                "PRESCRIPTION_CREATED",
                "PRESCRIPTION_RECORD",
                created.getId(),
                "Issued prescription " + prescription.getMedicine() + " for patient " + id,
                "SUCCESS",
                "127.0.0.1"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
