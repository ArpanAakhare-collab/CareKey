package com.carekey.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRToken {
    private String tokenId;
    private String patientId;
    private String tokenHash;
    private Instant createdAt;
    private Instant expiresAt;
    private boolean revoked;
}
