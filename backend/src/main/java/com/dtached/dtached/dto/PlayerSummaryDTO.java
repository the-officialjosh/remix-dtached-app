package com.dtached.dtached.dto;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlayerSummaryDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String position;
    private String height;
    private String weight;
    private String city;
    private String province;
    private String photoUrl;
}
