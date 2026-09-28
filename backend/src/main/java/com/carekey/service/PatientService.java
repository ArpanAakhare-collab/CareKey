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
        return patients.stream()
                .filter(p -> (p.getId() != null && p.getId().equalsIgnoreCase(id)) ||
                             (p.getPatientReference() != null && p.getPatientReference().equalsIgnoreCase(id)))
                .findFirst();
    }

    public Optional<Patient> getPatientByOwnerUid(String ownerUid) {
        return patients.stream()
                .filter(p -> (p.getOwnerUid() != null && p.getOwnerUid().equalsIgnoreCase(ownerUid)) ||
                             (p.getId() != null && p.getId().equalsIgnoreCase(ownerUid)))
                .findFirst();
    }

    public Optional<Patient> findByQRToken(String token) {
        return patients.stream()
                .filter(p -> (p.getQrToken() != null && p.getQrToken().equalsIgnoreCase(token)) ||
                             (p.getId() != null && p.getId().equalsIgnoreCase(token)) ||
                             (p.getPatientReference() != null && p.getPatientReference().equalsIgnoreCase(token)))
                .findFirst();
    }

    public synchronized Patient createPatient(Patient patient, String doctorId) {
        String refId = "CK-" + (10000 + (int)(Math.random() * 90000));
        patient.setId(refId);
        patient.setPatientReference(refId);
        patient.setCreatedByDoctorId(doctorId);
        patient.setCreatedAt(Instant.now());
        patient.setUpdatedAt(Instant.now());
        patient.setQrStatus("Active");
        if (patient.getQrToken() == null || patient.getQrToken().isBlank()) {
            patient.setQrToken("https://carekey.app/access/" + refId + "-SEC" + (1000 + (int)(Math.random() * 9000)));
        }
        patients.add(patient);
        return patient;
    }

    public List<Patient> searchPatients(String query) {
        if (query == null || query.isBlank()) {
            return new ArrayList<>(patients);
        }
        String term = query.trim().toLowerCase();
        List<Patient> result = new ArrayList<>();
        for (Patient p : patients) {
            if ((p.getPatientReference() != null && p.getPatientReference().toLowerCase().contains(term)) ||
                (p.getId() != null && p.getId().toLowerCase().contains(term)) ||
                (p.getName() != null && p.getName().toLowerCase().contains(term)) ||
                (p.getPhone() != null && p.getPhone().toLowerCase().contains(term)) ||
                (p.getEmail() != null && p.getEmail().toLowerCase().contains(term))) {
                result.add(p);
            }
        }
        return result;
    }

    public synchronized Optional<Patient> updatePatientProfile(String ownerUid, Patient profileData) {
        Optional<Patient> existingOpt = getPatientByOwnerUid(ownerUid);
        if (existingOpt.isEmpty()) {
            // Auto create profile for patient
            String refId = "CK-" + (10000 + (int)(Math.random() * 90000));
            profileData.setId(refId);
            profileData.setPatientReference(refId);
            profileData.setOwnerUid(ownerUid);
            profileData.setProfileCompleted(true);
            profileData.setCreatedAt(Instant.now());
            profileData.setUpdatedAt(Instant.now());
            if (profileData.getQrToken() == null) {
                profileData.setQrToken("https://carekey.app/access/" + refId + "-SEC" + (1000 + (int)(Math.random() * 9000)));
            }
            patients.add(profileData);
            return Optional.of(profileData);
        }

        Patient existing = existingOpt.get();
        if (profileData.getName() != null) existing.setName(profileData.getName());
        if (profileData.getDateOfBirth() != null) existing.setDateOfBirth(profileData.getDateOfBirth());
        if (profileData.getGender() != null) existing.setGender(profileData.getGender());
        if (profileData.getBloodGroup() != null) existing.setBloodGroup(profileData.getBloodGroup());
        if (profileData.getPhone() != null) existing.setPhone(profileData.getPhone());
        if (profileData.getEmail() != null) existing.setEmail(profileData.getEmail());
        if (profileData.getAddress() != null) existing.setAddress(profileData.getAddress());
        if (profileData.getCity() != null) existing.setCity(profileData.getCity());
        if (profileData.getDistrict() != null) existing.setDistrict(profileData.getDistrict());
        if (profileData.getState() != null) existing.setState(profileData.getState());
        if (profileData.getEmergencyContactName() != null) existing.setEmergencyContactName(profileData.getEmergencyContactName());
        if (profileData.getEmergencyContactPhone() != null) existing.setEmergencyContactPhone(profileData.getEmergencyContactPhone());
        if (profileData.getAllergies() != null) existing.setAllergies(profileData.getAllergies());
        if (profileData.getExistingConditions() != null) existing.setExistingConditions(profileData.getExistingConditions());
        if (profileData.getCurrentMedications() != null) existing.setCurrentMedications(profileData.getCurrentMedications());
        existing.setProfileCompleted(true);
        existing.setUpdatedAt(Instant.now());
        return Optional.of(existing);
    }
}

