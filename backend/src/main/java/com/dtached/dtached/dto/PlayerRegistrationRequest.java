package com.dtached.dtached.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlayerRegistrationRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Date of birth is required")
    private String dob;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Position is required")
    private String position;

    private String height;
    private String weight;
    private String city;
    private String province;
    private String eventType;
    private String planPackage;
    private String jerseySize;
    private String shortsSize;

    // Optional — if provided, player joins the team
    private String inviteCode;
}
