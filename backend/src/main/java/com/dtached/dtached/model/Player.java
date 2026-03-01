package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "players")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    private String dob;
    private String gender;
    private String position;
    private String height;
    private String weight;
    private String city;

    @Column(name = "province_state")
    private String provinceState;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "player_photo_url")
    private String playerPhotoUrl;

    @Column(name = "current_program")
    private String currentProgram;

    @Column(name = "event_type")
    private String eventType;

    @Column(name = "plan_package")
    private String planPackage;

    @Column(name = "jersey_size")
    private String jerseySize;

    @Column(name = "shorts_size")
    private String shortsSize;

    @Column(name = "video_url")
    private String videoUrl;

    private Integer number;

    @Column(nullable = false)
    @Builder.Default
    private String status = "FREE_AGENT";

    @Column(name = "registration_status")
    private String registrationStatus;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "jersey_confirmed", nullable = false)
    @Builder.Default
    private Boolean jerseyConfirmed = false;

    @Column(name = "roster_locked", nullable = false)
    @Builder.Default
    private Boolean rosterLocked = false;

    // Stats
    @Column(name = "total_yards", nullable = false) @Builder.Default private Integer totalYards = 0;
    @Column(name = "total_catches", nullable = false) @Builder.Default private Integer totalCatches = 0;
    @Column(name = "total_interceptions", nullable = false) @Builder.Default private Integer totalInterceptions = 0;
    @Column(name = "total_touchdowns", nullable = false) @Builder.Default private Integer totalTouchdowns = 0;
    @Column(name = "total_pass_yards", nullable = false) @Builder.Default private Integer totalPassYards = 0;
    @Column(name = "total_pass_attempts", nullable = false) @Builder.Default private Integer totalPassAttempts = 0;
    @Column(name = "total_pass_completions", nullable = false) @Builder.Default private Integer totalPassCompletions = 0;
    @Column(name = "total_sacks", nullable = false) @Builder.Default private Integer totalSacks = 0;

    // Computed helper
    @Transient
    public String getFullName() {
        if (middleName != null && !middleName.isBlank()) {
            return firstName + " " + middleName + " " + lastName;
        }
        return firstName + " " + lastName;
    }
}
