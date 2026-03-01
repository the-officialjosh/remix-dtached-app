package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "team_needs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TeamNeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(nullable = false)
    private String position;

    @Column(nullable = false)
    @Builder.Default
    private Integer count = 1;
}
