package com.carekey.dto;

import com.carekey.model.Patient;
import com.carekey.model.Prescription;
import com.carekey.model.Visit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRequest {
    private String patientId;
    private Patient patient;
    private List<Visit> visits;
    private List<Prescription> prescriptions;
    private String medicalText;
    private String context;
    private String question;
    private Map<String, Object> aggregateContext;
}
