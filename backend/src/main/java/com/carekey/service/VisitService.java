package com.carekey.service;

import com.carekey.model.Visit;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VisitService {

    private final List<Visit> visits = new ArrayList<>();

    public VisitService() {
        Map<String, String> vitals1 = new HashMap<>();
        vitals1.put("bp", "128/82 mmHg");
        vitals1.put("pulse", "88 bpm");
        vitals1.put("spo2", "94%");
        vitals1.put("temp", "98.6 °F");
        vitals1.put("weight", "74 kg");

        visits.add(Visit.builder()
                .id("vis-101")
                .patientId("pat-98214-pune")
                .clinicianId("clinician-dr-sharma-01")
                .clinicianName("Dr. Ananya Sharma")
                .facilityId("fac-pune-01")
                .facilityName("Ruby Hall Chest Clinic, Pune")
                .conditionCategory("Respiratory")
                .diagnosis("Acute Exacerbation of Bronchial Asthma secondary to seasonal smog")
                .vitals(vitals1)
                .date(Instant.now().minusSeconds(86400 * 8))
                .notes("Patient presented with nocturnal wheezing and shortness of breath during morning jogs. Bilateral expiratory wheezes audible on auscultation. Nebulized with Levosalbutamol + Ipratropium with good recovery.")
                .build());

        Map<String, String> vitals2 = new HashMap<>();
        vitals2.put("bp", "134/86 mmHg");
        vitals2.put("pulse", "76 bpm");
        vitals2.put("spo2", "98%");
        vitals2.put("temp", "98.4 °F");
        vitals2.put("weight", "75 kg");

        visits.add(Visit.builder()
                .id("vis-102")
                .patientId("pat-98214-pune")
                .clinicianId("clinician-dr-sharma-01")
                .clinicianName("Dr. Ananya Sharma")
                .facilityId("fac-pune-01")
                .facilityName("Ruby Hall Chest Clinic, Pune")
                .conditionCategory("Cardiovascular")
                .diagnosis("Routine Hypertension & Asthma Follow-up")
                .vitals(vitals2)
                .date(Instant.now().minusSeconds(86400 * 120))
                .notes("Regular quarterly follow-up. Blood pressure stable on current Telmisartan dosage. Inhaler technique verified.")
                .build());
    }

    public List<Visit> getVisitsForPatient(String patientId) {
        return visits.stream()
                .filter(v -> v.getPatientId().equalsIgnoreCase(patientId))
                .sorted(Comparator.comparing(Visit::getDate).reversed())
                .collect(Collectors.toList());
    }

    public Visit addVisit(Visit newVisit) {
        if (newVisit.getId() == null) {
            newVisit.setId("vis-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (newVisit.getDate() == null) {
            newVisit.setDate(Instant.now());
        }
        visits.add(0, newVisit);
        return newVisit;
    }
}
