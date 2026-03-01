package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_divisions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EventDivision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private TournamentEvent event;

    @Column(nullable = false)
    private String name;

    @Column(name = "age_group")
    private String ageGroup;

    @Column(name = "max_teams")
    private Integer maxTeams;

    private String format;
}
