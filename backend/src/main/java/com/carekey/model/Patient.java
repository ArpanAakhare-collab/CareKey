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
    private String name;
    private String dateOfBirth;
    private int age;
    private String gender;
    private String bloodGroup;
    private String emergencyContact;
    private List<String> allergies;
    private List<String> chronicConditions;
    private String region;
    private String district;
    private String state;
    private String qrToken;
    private Instant createdAt;
}
