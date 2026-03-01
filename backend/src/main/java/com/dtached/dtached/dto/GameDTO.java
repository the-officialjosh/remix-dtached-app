package com.dtached.dtached.dto;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GameDTO {
    private Long id;
    private String homeTeam;
    private String awayTeam;
    private Long homeTeamId;
    private Long awayTeamId;
    private String field;
    private String type;
    private String startTime;
    private String status;
    private Integer homeScore;
    private Integer awayScore;
    private Long possessionTeamId;
    private Integer currentDown;
    private String distance;
    private String yardLine;
    private String streamUrl;
}
