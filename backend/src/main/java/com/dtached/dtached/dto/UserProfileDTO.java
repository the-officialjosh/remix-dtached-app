package com.dtached.dtached.dto;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserProfileDTO {
    private Long userId;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private String photoUrl;
    private Boolean emailConfirmed;

    // Player profile (null if no player linked)
    private Long playerId;
    private String position;
    private String height;
    private String weight;
    private String city;
    private String province;
    private Integer jerseyNumber;
    private String bio;
    private String status;
    private String teamName;
}
