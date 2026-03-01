package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "release_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReleaseRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(name = "player_name")
    private String playerName;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "team_name")
    private String teamName;

    @Column(name = "released_by_user_id", nullable = false)
    private Long releasedByUserId;

    @Column(name = "released_by_name")
    private String releasedByName;

    @Column(length = 50)
    private String reason;

    @Column(name = "released_at", nullable = false)
    @Builder.Default
    private LocalDateTime releasedAt = LocalDateTime.now();
}
