package com.carekey.dto;

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
public class AnalyticsResponse {
    private int privacyThresholdK;
    private int totalCohortsEvaluated;
    private int suppressedCohortsCount;
    private List<CohortItem> data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CohortItem {
        private String region;
        private String period;
        private String condition;
        private boolean isSuppressed;
        private Integer caseCount;
        private String trendPercentage;
        private String suppressionReason;
        private Map<String, Integer> severityDistribution;
    }
}
