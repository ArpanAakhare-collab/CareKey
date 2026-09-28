package com.carekey.service;

import com.carekey.model.Prescription;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final List<Prescription> prescriptions = new ArrayList<>();

    public PrescriptionService() {
        prescriptions.add(Prescription.builder()
                .id("rx-901")
                .patientId("pat-98214-pune")
                .clinicianId("clinician-dr-sharma-01")
                .clinicianName("Dr. Ananya Sharma")
                .visitId("vis-101")
                .medicine("Budesonide + Formoterol Inhaler (200/6 mcg)")
                .dosage("2 Puffs")
                .frequency("Twice daily (Morning & Night)")
                .duration("60 Days")
                .instructions("Rinse mouth thoroughly with water after each inhalation.")
                .date(LocalDate.now().minusDays(8))
                .active(true)
                .build());

        prescriptions.add(Prescription.builder()
                .id("rx-902")
                .patientId("pat-98214-pune")
                .clinicianId("clinician-dr-sharma-01")
                .clinicianName("Dr. Ananya Sharma")
                .visitId("vis-101")
                .medicine("Levocetirizine + Montelukast (5mg / 10mg)")
                .dosage("1 Tablet")
                .frequency("Once daily at bedtime")
                .duration("14 Days")
                .instructions("Take after dinner.")
                .date(LocalDate.now().minusDays(8))
                .active(true)
                .build());

        prescriptions.add(Prescription.builder()
                .id("rx-903")
                .patientId("pat-98214-pune")
                .clinicianId("clinician-dr-sharma-01")
                .clinicianName("Dr. Ananya Sharma")
                .visitId("vis-102")
                .medicine("Telmisartan 40mg")
                .dosage("1 Tablet")
                .frequency("Once daily in the morning")
                .duration("90 Days")
                .instructions("Monitor blood pressure weekly.")
                .date(LocalDate.now().minusDays(120))
                .active(true)
                .build());
    }

    public List<Prescription> getPrescriptionsForPatient(String patientId) {
        return prescriptions.stream()
                .filter(p -> p.getPatientId().equalsIgnoreCase(patientId))
                .sorted(Comparator.comparing(Prescription::getDate).reversed())
                .collect(Collectors.toList());
    }

    public Prescription addPrescription(Prescription newRx) {
        if (newRx.getId() == null) {
            newRx.setId("rx-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (newRx.getDate() == null) {
            newRx.setDate(LocalDate.now());
        }
        newRx.setActive(true);
        prescriptions.add(0, newRx);
        return newRx;
    }
}
