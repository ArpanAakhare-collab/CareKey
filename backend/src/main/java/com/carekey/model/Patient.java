package com.carekey.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    private String id;
    private String patientReference;
    private String ownerUid;
    private String name;
    private String dateOfBirth;
    private int age;
    private String gender;
    private String bloodGroup;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String district;
    private String state;
    private String region;
    private String emergencyContact;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private List<String> allergies;
    private List<String> chronicConditions;
    private String existingConditions;
    private String currentMedications;
    private String medicalNotes;
    private boolean profileCompleted;
    private String qrToken;
    private String qrStatus;
    private String createdByDoctorId;
    private Instant createdAt;
    private Instant updatedAt;
}

