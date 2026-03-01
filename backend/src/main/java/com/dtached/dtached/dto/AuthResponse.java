package com.dtached.dtached.dto;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private String role;          // null if not yet selected
    private String firstName;
    private String lastName;
    private Long userId;
    private boolean emailConfirmed;
    private boolean needsRole;    // true if role hasn't been selected yet
}
