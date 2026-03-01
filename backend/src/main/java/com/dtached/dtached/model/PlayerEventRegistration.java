package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "player_event_registrations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlayerEventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private TournamentEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id")
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "division_id")
    private EventDivision division;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private EventPackage eventPackage;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "jersey_size")
    private String jerseySize;

    @Column(name = "shorts_size")
    private String shortsSize;

    @Column(name = "team_name")
    private String teamName;

    private String category;

    @Column(name = "has_team")
    @Builder.Default
    private Boolean hasTeam = false;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "payment_status")
    @Builder.Default
    private String paymentStatus = "UNPAID";

    private String notes;

    @Column(name = "registered_at", nullable = false)
    @Builder.Default
    private LocalDateTime registeredAt = LocalDateTime.now();
}
