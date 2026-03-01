package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "player_id")
    private Long playerId;

    @Column(name = "team_id")
    private Long teamId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pricing_tier_id")
    private PricingTier pricingTier;

    @Column(name = "stripe_session_id")
    private String stripeSessionId;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "amount_cents", nullable = false)
    private Integer amountCents;

    @Column(length = 3, nullable = false)
    @Builder.Default
    private String currency = "CAD";

    @Column(length = 30, nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "payment_type", length = 30, nullable = false)
    private String paymentType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
