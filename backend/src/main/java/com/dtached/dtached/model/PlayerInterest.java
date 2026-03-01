package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "player_interests",
       uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "player_id", "direction"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlayerInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    /** TEAM_TO_PLAYER or PLAYER_TO_TEAM */
    @Column(nullable = false)
    private String direction;

    /** PENDING, MATCHED, APPROVED, REJECTED */
    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
