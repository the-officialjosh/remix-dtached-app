package com.dtached.dtached.service;

import com.dtached.dtached.model.*;
import com.dtached.dtached.repository.*;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PricingTierRepository pricingTierRepository;
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    @Value("${stripe.secret-key:sk_test_placeholder}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:whsec_placeholder}")
    private String webhookSecret;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Create a Stripe Checkout Session for a Player Card purchase.
     */
    @Transactional
    public Map<String, String> createPlayerCardCheckout(String email) throws StripeException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile found"));

        if (Boolean.TRUE.equals(player.getIsVerified())) {
            throw new IllegalStateException("Player is already verified");
        }

        PricingTier tier = pricingTierRepository.findByName("PLAYER_CARD")
                .orElseThrow(() -> new RuntimeException("PLAYER_CARD tier not found"));

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "?payment=success")
                .setCancelUrl(frontendUrl + "?payment=cancelled")
                .setCustomerEmail(email)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(tier.getCurrency().toLowerCase())
                                .setUnitAmount((long) tier.getPriceCents())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Dtached Player Card")
                                        .setDescription("Verified player status + digital player card")
                                        .build())
                                .build())
                        .build())
                .putMetadata("payment_type", "PLAYER_CARD")
                .putMetadata("user_id", user.getId().toString())
                .putMetadata("player_id", player.getId().toString())
                .build();

        Session session = Session.create(params);

        // Save payment record
        Payment payment = Payment.builder()
                .userId(user.getId())
                .playerId(player.getId())
                .pricingTier(tier)
                .stripeSessionId(session.getId())
                .amountCents(tier.getPriceCents())
                .currency(tier.getCurrency())
                .status("PENDING")
                .paymentType("PLAYER_CARD")
                .description("Player Card — " + player.getFirstName() + " " + player.getLastName())
                .build();
        paymentRepository.save(payment);

        return Map.of("sessionId", session.getId(), "url", session.getUrl());
    }

    /**
     * Create a Stripe Checkout Session for a Team Tournament Entry.
     */
    @Transactional
    public Map<String, String> createTeamEntryCheckout(String email, Long teamId) throws StripeException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        PricingTier tier = pricingTierRepository.findByName("TEAM_ENTRY")
                .orElseThrow(() -> new RuntimeException("TEAM_ENTRY tier not found"));

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "?payment=success")
                .setCancelUrl(frontendUrl + "?payment=cancelled")
                .setCustomerEmail(email)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(tier.getCurrency().toLowerCase())
                                .setUnitAmount((long) tier.getPriceCents())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Dtached Team Tournament Entry")
                                        .setDescription("Tournament entry for " + team.getName() + " — all members verified")
                                        .build())
                                .build())
                        .build())
                .putMetadata("payment_type", "TEAM_ENTRY")
                .putMetadata("user_id", user.getId().toString())
                .putMetadata("team_id", team.getId().toString())
                .build();

        Session session = Session.create(params);

        Payment payment = Payment.builder()
                .userId(user.getId())
                .teamId(teamId)
                .pricingTier(tier)
                .stripeSessionId(session.getId())
                .amountCents(tier.getPriceCents())
                .currency(tier.getCurrency())
                .status("PENDING")
                .paymentType("TEAM_ENTRY")
                .description("Team Entry — " + team.getName())
                .build();
        paymentRepository.save(payment);

        return Map.of("sessionId", session.getId(), "url", session.getUrl());
    }

    /**
     * Handle Stripe webhook events.
     */
    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook signature verification failed", e);
            throw new RuntimeException("Invalid webhook signature");
        } catch (Exception e) {
            log.error("Stripe webhook parsing failed", e);
            throw new RuntimeException("Invalid webhook payload");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject().orElse(null);
            if (session != null) {
                handleCheckoutComplete(session);
            }
        }
    }

    private void handleCheckoutComplete(Session session) {
        Payment payment = paymentRepository.findByStripeSessionId(session.getId())
                .orElse(null);
        if (payment == null) {
            log.warn("No payment found for session: {}", session.getId());
            return;
        }

        payment.setStatus("COMPLETED");
        payment.setStripePaymentIntentId(session.getPaymentIntent());
        payment.setCompletedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Fulfill based on type
        switch (payment.getPaymentType()) {
            case "PLAYER_CARD" -> fulfillPlayerCard(payment);
            case "TEAM_ENTRY" -> fulfillTeamEntry(payment);
            default -> log.warn("Unknown payment type: {}", payment.getPaymentType());
        }
    }

    private void fulfillPlayerCard(Payment payment) {
        if (payment.getPlayerId() != null) {
            playerRepository.findById(payment.getPlayerId()).ifPresent(player -> {
                player.setIsVerified(true);
                player.setStatus("FREE_AGENT");
                playerRepository.save(player);
                log.info("Player {} verified via Player Card purchase", player.getId());
            });
        }
    }

    private void fulfillTeamEntry(Payment payment) {
        if (payment.getTeamId() != null) {
            List<Player> teamPlayers = playerRepository.findByTeamId(payment.getTeamId());
            for (Player player : teamPlayers) {
                player.setIsVerified(true);
                playerRepository.save(player);
            }
            log.info("Team {} — {} players verified via Team Entry purchase",
                    payment.getTeamId(), teamPlayers.size());
        }
    }

    /**
     * Get all payments (admin).
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    /**
     * Get payments for a specific user.
     */
    public List<Payment> getUserPayments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paymentRepository.findByUserId(user.getId());
    }

    /**
     * Get pricing tiers.
     */
    public List<PricingTier> getPricingTiers() {
        return pricingTierRepository.findAll();
    }

    /**
     * Revenue summary for admin dashboard.
     */
    public Map<String, Object> getRevenueSummary() {
        List<Payment> all = paymentRepository.findAll();
        List<Payment> completed = all.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .toList();

        long totalRevenue = completed.stream()
                .mapToLong(Payment::getAmountCents).sum();
        long playerCardCount = completed.stream()
                .filter(p -> "PLAYER_CARD".equals(p.getPaymentType())).count();
        long teamEntryCount = completed.stream()
                .filter(p -> "TEAM_ENTRY".equals(p.getPaymentType())).count();

        return Map.of(
                "totalRevenueCents", totalRevenue,
                "totalPayments", completed.size(),
                "playerCardCount", playerCardCount,
                "teamEntryCount", teamEntryCount,
                "pendingPayments", all.size() - completed.size()
        );
    }

    /**
     * Team-level payment summary.
     */
    public Map<String, Object> getTeamPaymentSummary(Long teamId) {
        teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        List<Payment> teamPayments = paymentRepository.findByTeamId(teamId);
        
        long totalPaid = teamPayments.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToLong(Payment::getAmountCents).sum();
                
        long totalOutstanding = teamPayments.stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .mapToLong(Payment::getAmountCents).sum();

        // Find which players have completed player cards
        List<Payment> playerPayments = paymentRepository.findAll().stream()
                .filter(p -> "PLAYER_CARD".equals(p.getPaymentType()) && "COMPLETED".equals(p.getStatus()))
                .toList();
                
        List<Long> verifiedPlayerIds = playerPayments.stream()
                .map(Payment::getPlayerId)
                .filter(id -> id != null)
                .toList();

        return Map.of(
                "teamId", teamId,
                "totalPaidCents", totalPaid,
                "totalOutstandingCents", totalOutstanding,
                "verifiedPlayerIds", verifiedPlayerIds,
                "payments", teamPayments
        );
    }
}
