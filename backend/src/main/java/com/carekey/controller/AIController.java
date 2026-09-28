package com.carekey.controller;

import com.carekey.dto.AIRequest;
import com.carekey.dto.AIResponse;
import com.carekey.security.SecurityUtils;
import com.carekey.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/clinical-summary")
    @PreAuthorize("hasRole('CLINICIAN')")
    public ResponseEntity<AIResponse> generateClinicalSummary(@RequestBody AIRequest request) {
        String clinicianId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(aiService.generateClinicalSummary(request, clinicianId));
    }

    @PostMapping("/patient-explanation")
    @PreAuthorize("hasRole('CLINICIAN')")
    public ResponseEntity<AIResponse> generatePatientExplanation(@RequestBody AIRequest request) {
        String clinicianId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(aiService.generatePatientExplanation(request.getMedicalText(), request.getContext(), clinicianId));
    }

    @PostMapping("/admin-assistant")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AIResponse> queryAdminAssistant(@RequestBody AIRequest request) {
        String adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(aiService.queryAdminAssistant(request.getQuestion(), request.getAggregateContext(), adminId));
    }

    @PostMapping("/chat")
    public ResponseEntity<AIResponse> chat(@RequestBody AIRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(aiService.chat(request.getQuestion(), userId));
    }
}
