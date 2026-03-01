package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_events")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TournamentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
    private String location;
    private String address;
    private String city;

    @Column(name = "province_state")
    private String provinceState;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "registration_deadline")
    private LocalDate registrationDeadline;

    @Column(nullable = false)
    @Builder.Default
    private String format = "7v7";

    @Column(nullable = false)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "max_teams")
    private Integer maxTeams;

    @Column(name = "entry_fee")
    private BigDecimal entryFee;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
