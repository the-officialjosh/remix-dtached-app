package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "team_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TeamRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    @JsonIgnoreProperties("players")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    @JsonIgnoreProperties("team")
    private Player player;

    @Column(nullable = false)
    private String direction;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    /** JOIN or TRANSFER */
    @Column(name = "request_type", nullable = false)
    @Builder.Default
    private String requestType = "JOIN";

    /** The team the player is leaving (only for TRANSFER) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_team_id")
    @JsonIgnoreProperties("players")
    private Team fromTeam;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
