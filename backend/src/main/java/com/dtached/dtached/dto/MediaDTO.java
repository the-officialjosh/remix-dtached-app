package com.dtached.dtached.dto;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MediaDTO {
    private Long id;
    private Long playerId;
    private Long teamId;
    private String url;
    private String type;
    private Boolean isPremium;
}
