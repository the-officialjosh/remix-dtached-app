package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "games")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_team_id", nullable = false)
    private Team homeTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_team_id", nullable = false)
    private Team awayTeam;

    private String field;

    @Column(nullable = false)
    @Builder.Default
    private String type = "7v7";

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(nullable = false)
    @Builder.Default
    private String status = "scheduled";

    @Column(name = "home_score", nullable = false) @Builder.Default private Integer homeScore = 0;
    @Column(name = "away_score", nullable = false) @Builder.Default private Integer awayScore = 0;

    @Column(name = "possession_team_id")
    private Long possessionTeamId;

    @Column(name = "current_down")
    private Integer currentDown;

    private String distance;

    @Column(name = "yard_line")
    private String yardLine;

    @Column(name = "stream_url")
    private String streamUrl;
}
