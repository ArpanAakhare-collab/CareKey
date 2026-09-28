package com.carekey.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregateCase {
    private String id;
    private String region;
    private String period;
    private String condition;
    private int rawCaseCount;
    private String trendPercentage;
    private Map<String, Integer> severityDistribution;
}
