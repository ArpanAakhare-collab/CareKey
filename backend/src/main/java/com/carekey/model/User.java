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
public class User {
    private String uid;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String organizationId;
    private String organizationName;
    private String specialty;
    private Instant createdAt;
}
