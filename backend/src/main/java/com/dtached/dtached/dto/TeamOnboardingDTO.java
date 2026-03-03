package com.dtached.dtached.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamOnboardingDTO {

    private String teamName;
    private String city;
    private String provinceState;
    private String division;
    private String type;
    private String bio;

    private String coachFirstName;
    private String coachLastName;
    private String coachEmail;
    private String coachPhone;

    private int managerCount;
    private List<ManagerDetail> managers;

    private String eventInterest;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManagerDetail {
        private String firstName;
        private String lastName;
        private String email;
    }
}
