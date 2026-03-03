package com.dtached.dtached.dto;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlayerDTO {
    private Long id;
    private String name;
    private String teamName;
    private Integer number;
    private String position;
    private String photo;
    private String height;
    private String weight;
    private String city;
    private String provinceState;
    private String instagram;
    private String dob;
    private String gender;
    private Integer totalYards;
    private Integer totalCatches;
    private Integer totalInterceptions;
    private Integer totalTouchdowns;
    private Integer totalPassYards;
    private Integer totalPassAttempts;
    private Integer totalPassCompletions;
    private Integer totalSacks;
    private String linkedUserId;
    private Integer isVerified;
    private String registrationStatus;
    private String pendingTeamName;
    private String pendingCategory;
    private Integer jerseyConfirmed;
    private String playerTag;
}
