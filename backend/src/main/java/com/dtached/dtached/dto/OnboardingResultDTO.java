package com.dtached.dtached.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingResultDTO {

    private Long teamId;
    private String teamName;
    private String inviteCode;

    private String coachEmail;
    private String coachTempPassword;

    private List<ManagerCredential> managerCredentials;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManagerCredential {
        private String email;
        private String firstName;
        private String lastName;
        private String tempPassword;
    }
}
