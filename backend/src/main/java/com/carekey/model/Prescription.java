package com.carekey.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    private String id;
    private String patientId;
    private String clinicianId;
    private String clinicianName;
    private String visitId;
    private String medicine;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
    private LocalDate date;
    private boolean active;
}
