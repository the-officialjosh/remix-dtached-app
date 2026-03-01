package com.dtached.dtached.dto;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalUsers;
    private long totalTeams;
    private long totalPlayers;
    private long pendingTeams;
    private long freeAgents;
    private long activeGames;
}
