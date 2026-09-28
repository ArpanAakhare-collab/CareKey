package com.carekey.service;

import com.carekey.dto.AnalyticsResponse;
import com.carekey.model.AggregateCase;
import com.carekey.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AuditService auditService;

    @Value("${privacy.aggregation.threshold-k:10}")
    private int privacyThresholdK;

    private final List<AggregateCase> aggregateDatabase = new ArrayList<>();

    {
        // Seed aggregate surveillance data (some with N < 10 to demonstrate suppression)
        aggregateDatabase.add(AggregateCase.builder().id("agg-1").region("Pune").period("2026-08").condition("Respiratory").rawCaseCount(47).trendPercentage("+18.4%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-2").region("Pune").period("2026-09").condition("Respiratory").rawCaseCount(62).trendPercentage("+31.9%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-3").region("Pune").period("2026-09").condition("Infectious").rawCaseCount(29).trendPercentage("-23.6%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-4").region("Pune").period("2026-09").condition("Cardiovascular").rawCaseCount(54).trendPercentage("+2.1%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-5").region("Pune").period("2026-09").condition("Endocrine/Metabolic").rawCaseCount(78).trendPercentage("+4.3%").build());
        
        // Rare Genetic in Pune -> caseCount = 4 (< 10) -> WILL BE SUPPRESSED
        aggregateDatabase.add(AggregateCase.builder().id("agg-6").region("Pune").period("2026-09").condition("Rare Genetic/Orphan").rawCaseCount(4).trendPercentage("0%").build());

        // Mumbai
        aggregateDatabase.add(AggregateCase.builder().id("agg-7").region("Mumbai").period("2026-08").condition("Respiratory").rawCaseCount(84).trendPercentage("+8.2%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-8").region("Mumbai").period("2026-09").condition("Respiratory").rawCaseCount(95).trendPercentage("+13.0%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-9").region("Mumbai").period("2026-09").condition("Infectious").rawCaseCount(112).trendPercentage("+24.4%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-10").region("Mumbai").period("2026-09").condition("Cardiovascular").rawCaseCount(140).trendPercentage("+1.5%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-11").region("Mumbai").period("2026-09").condition("Rare Genetic/Orphan").rawCaseCount(6).trendPercentage("0%").build());

        // Delhi
        aggregateDatabase.add(AggregateCase.builder().id("agg-12").region("Delhi NCR").period("2026-08").condition("Respiratory").rawCaseCount(128).trendPercentage("+41.2%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-13").region("Delhi NCR").period("2026-09").condition("Respiratory").rawCaseCount(165).trendPercentage("+28.9%").build());

        // Solapur (Rural Tier-3) -> Demonstrating cohort suppression in small populations
        aggregateDatabase.add(AggregateCase.builder().id("agg-14").region("Solapur (Rural Tier-3)").period("2026-09").condition("Respiratory").rawCaseCount(7).trendPercentage("+12.0%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-15").region("Solapur (Rural Tier-3)").period("2026-09").condition("Cardiovascular").rawCaseCount(5).trendPercentage("-10.0%").build());
        aggregateDatabase.add(AggregateCase.builder().id("agg-16").region("Solapur (Rural Tier-3)").period("2026-09").condition("Infectious").rawCaseCount(14).trendPercentage("+100.0%").build());
    }

    public AnalyticsResponse queryAggregates(String region, String condition, String period, String adminId) {
        List<AggregateCase> filtered = aggregateDatabase.stream()
                .filter(a -> region == null || region.isBlank() || region.equalsIgnoreCase("all") || a.getRegion().equalsIgnoreCase(region))
                .filter(a -> condition == null || condition.isBlank() || condition.equalsIgnoreCase("all") || a.getCondition().equalsIgnoreCase(condition))
                .filter(a -> period == null || period.isBlank() || period.equalsIgnoreCase("all") || a.getPeriod().equalsIgnoreCase(period))
                .collect(Collectors.toList());

        List<AnalyticsResponse.CohortItem> sanitizedCohorts = new ArrayList<>();
        int suppressedCount = 0;

        for (AggregateCase rawCase : filtered) {
            // Apply K=10 Privacy Threshold (PRD §14)
            if (rawCase.getRawCaseCount() < privacyThresholdK) {
                suppressedCount++;
                sanitizedCohorts.add(AnalyticsResponse.CohortItem.builder()
                        .region(rawCase.getRegion())
                        .period(rawCase.getPeriod())
                        .condition(rawCase.getCondition())
                        .isSuppressed(true)
                        .caseCount(null) // Raw count strictly removed
                        .trendPercentage(rawCase.getTrendPercentage())
                        .suppressionReason("Data suppressed. Minimum group size requirement (K=" + privacyThresholdK + ") not met to prevent patient re-identification.")
                        .severityDistribution(null)
                        .build());

                auditService.logEvent(
                        adminId,
                        "Dr. Public Health Admin",
                        Role.ADMIN,
                        "PRIVACY_SUPPRESSION_TRIGGERED",
                        "AGGREGATE_COHORT",
                        rawCase.getRegion() + "-" + rawCase.getCondition(),
                        "K=" + privacyThresholdK + " privacy threshold enforced. Cohort size < " + privacyThresholdK + ". Microdata suppressed.",
                        "SUPPRESSED_PROTECTED",
                        "127.0.0.1"
                );
            } else {
                sanitizedCohorts.add(AnalyticsResponse.CohortItem.builder()
                        .region(rawCase.getRegion())
                        .period(rawCase.getPeriod())
                        .condition(rawCase.getCondition())
                        .isSuppressed(false)
                        .caseCount(rawCase.getRawCaseCount())
                        .trendPercentage(rawCase.getTrendPercentage())
                        .severityDistribution(rawCase.getSeverityDistribution())
                        .build());
            }
        }

        auditService.logEvent(
                adminId,
                "Dr. Public Health Admin",
                Role.ADMIN,
                "AGGREGATE_QUERY_EXECUTED",
                "ANALYTICS_AGGREGATES",
                (region != null ? region : "All") + "-" + (condition != null ? condition : "All"),
                "Surveillance query executed. " + filtered.size() + " cohorts evaluated, " + suppressedCount + " suppressed.",
                "SUCCESS",
                "127.0.0.1"
        );

        return AnalyticsResponse.builder()
                .privacyThresholdK(privacyThresholdK)
                .totalCohortsEvaluated(filtered.size())
                .suppressedCohortsCount(suppressedCount)
                .data(sanitizedCohorts)
                .build();
    }
}
