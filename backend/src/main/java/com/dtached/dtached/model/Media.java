package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "media")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id")
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    @Builder.Default
    private String type = "photo";

    @Column(name = "is_premium", nullable = false)
    @Builder.Default
    private Boolean isPremium = false;
}
