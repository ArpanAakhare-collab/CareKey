package com.carekey.controller;

import com.carekey.dto.AnalyticsResponse;
import com.carekey.security.SecurityUtils;
import com.carekey.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AnalyticsService analyticsService;

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String period) {
        String adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.queryAggregates(region, condition, period, adminId));
    }

    @GetMapping("/trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsResponse> getTrends(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String period) {
        String adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.queryAggregates(region, condition, period, adminId));
    }

    @GetMapping("/regions")
    public ResponseEntity<List<Map<String, Object>>> getRegions() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "pune", "name", "Pune", "state", "Maharashtra", "totalSurveillanceFacilities", 34),
                Map.of("id", "mumbai", "name", "Mumbai", "state", "Maharashtra", "totalSurveillanceFacilities", 62),
                Map.of("id", "delhi", "name", "Delhi NCR", "state", "Delhi", "totalSurveillanceFacilities", 58),
                Map.of("id", "bengaluru", "name", "Bengaluru", "state", "Karnataka", "totalSurveillanceFacilities", 41),
                Map.of("id", "solapur", "name", "Solapur (Rural Tier-3)", "state", "Maharashtra", "totalSurveillanceFacilities", 5)
        ));
    }

    @GetMapping("/conditions")
    public ResponseEntity<List<Map<String, Object>>> getConditions() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "Respiratory", "name", "Respiratory (Asthma, COPD, ILD)"),
                Map.of("id", "Infectious", "name", "Infectious Diseases (Viral, Flu, Dengue)"),
                Map.of("id", "Cardiovascular", "name", "Cardiovascular (Hypertension, CAD)"),
                Map.of("id", "Endocrine/Metabolic", "name", "Endocrine & Metabolic (Diabetes)"),
                Map.of("id", "Rare Genetic/Orphan", "name", "Rare Genetic / Orphan Disorders (High-risk re-identification)")
        ));
    }
}
