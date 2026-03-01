package com.dtached.dtached.dto;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String photoUrl;
    // Player-specific fields
    private String position;
    private String height;
    private String weight;
    private String city;
    private String province;
    private Integer jerseyNumber;
    private String bio;
    private String dob;
    private String gender;
}
