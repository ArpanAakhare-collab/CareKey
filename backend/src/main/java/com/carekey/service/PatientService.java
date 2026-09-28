package com.carekey.service;

import com.carekey.model.Patient;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final List<Patient> patients = new ArrayList<>();

    public PatientService() {
        // Seed patients
        patients.add(Patient.builder()
                .id("pat-98214-pune")
                .patientReference("CK-PN-2026-098")
                .name("Aarav K. Mehta")
                .dateOfBirth("1984-06-15")
                .age(42)
                .gender("Male")
                .bloodGroup("B+")
                .emergencyContact("+91 98901 44321 (Spouse)")
                .allergies(Arrays.asList("Penicillin", "Sulfonamides"))
                .chronicConditions(Arrays.asList("Moderate Persistent Asthma", "Primary Hypertension"))
                .region("Pune")
                .district("Haveli")
                .state("Maharashtra")
                .qrToken("sec-token-7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c")
                .createdAt(Instant.now())
                .build());

        patients.add(Patient.builder()
                .id("pat-43891-mumbai")
                .patientReference("CK-MB-2026-312")
                .name("Priyanka S. Deshmukh")
                .dateOfBirth("1992-11-23")
                .age(33)
                .gender("Female")
                .bloodGroup("O+")
                .emergencyContact("+91 97654 88990 (Brother)")
                .allergies(Arrays.asList("NSAIDs (Ibuprofen)"))
                .chronicConditions(Arrays.asList("Type 2 Diabetes Mellitus"))
                .region("Mumbai")
                .district("Mumbai Suburban")
                .state("Maharashtra")
                .qrToken("sec-token-1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d")
                .createdAt(Instant.now())
                .build());

        patients.add(Patient.builder()
                .id("pat-77102-delhi")
                .patientReference("CK-DL-2026-701")
                .name("Vikramjit Singh")
                .dateOfBirth("1968-02-04")
                .age(58)
                .gender("Male")
                .bloodGroup("A+")
                .emergencyContact("+91 98110 33221 (Daughter)")
                .allergies(Arrays.asList("No known drug allergies (NKDA)"))
                .chronicConditions(Arrays.asList("Coronary Artery Disease", "Hyperlipidemia"))
                .region("Delhi")
                .district("South Delhi")
                .state("Delhi NCR")
                .qrToken("sec-token-e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4")
                .createdAt(Instant.now())
                .build());
    }

    public List<Patient> getAllPatients() {
        return new ArrayList<>(patients);
    }

    public Optional<Patient> getPatientById(String id) {
        return patients.stream().filter(p -> p.getId().equalsIgnoreCase(id)).findFirst();
    }

    public Optional<Patient> findByQRToken(String token) {
        return patients.stream()
                .filter(p -> p.getQrToken().equalsIgnoreCase(token) || p.getId().equalsIgnoreCase(token) || p.getPatientReference().equalsIgnoreCase(token))
                .findFirst();
    }
}
