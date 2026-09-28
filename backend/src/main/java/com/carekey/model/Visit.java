package com.carekey.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Visit {
    private String id;
    private String patientId;
    private String clinicianId;
    private String clinicianName;
    private String facilityId;
    private String facilityName;
    private String conditionCategory;
    private String diagnosis;
    private Map<String, String> vitals;
    private Instant date;
    private String notes;
}
