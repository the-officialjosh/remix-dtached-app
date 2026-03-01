package com.dtached.dtached.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TeamRegistrationRequest {
    @NotBlank(message = "Team name is required")
    private String name;

    @NotBlank(message = "Tournament type is required")
    private String type; // 7v7 or Flag

    private String division;
    private String city;
    private String province;
    private String bio;
}
