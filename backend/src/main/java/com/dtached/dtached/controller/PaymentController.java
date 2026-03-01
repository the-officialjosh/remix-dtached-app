package com.dtached.dtached.controller;

import com.dtached.dtached.model.Payment;
import com.dtached.dtached.model.PricingTier;
import com.dtached.dtached.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Get available pricing tiers.
     */
    @GetMapping("/tiers")
    public ResponseEntity<List<PricingTier>> getPricingTiers() {
        return ResponseEntity.ok(paymentService.getPricingTiers());
    }

    /**
     * Create checkout session for Player Card purchase.
     */
    @PostMapping("/checkout/player-card")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<Map<String, String>> checkoutPlayerCard(Authentication auth) {
        try {
            Map<String, String> result = paymentService.createPlayerCardCheckout(auth.getName());
            return ResponseEntity.ok(result);
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Payment service error: " + e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create checkout session for Team Tournament Entry.
     */
    @PostMapping("/checkout/team-entry")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> checkoutTeamEntry(
            Authentication auth,
            @RequestBody Map<String, Long> body
    ) {
        Long teamId = body.get("teamId");
        if (teamId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "teamId is required"));
        }
        try {
            Map<String, String> result = paymentService.createTeamEntryCheckout(auth.getName(), teamId);
            return ResponseEntity.ok(result);
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Payment service error: " + e.getMessage()));
        }
    }

    /**
     * Stripe webhook handler — no auth required.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            paymentService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    /**
     * Get current user's payment history.
     */
    @GetMapping("/my")
    public ResponseEntity<List<Payment>> getMyPayments(Authentication auth) {
        return ResponseEntity.ok(paymentService.getUserPayments(auth.getName()));
    }

    /**
     * Admin: get all payments.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    /**
     * Admin: revenue summary.
     */
    @GetMapping("/admin/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRevenueSummary() {
        return ResponseEntity.ok(paymentService.getRevenueSummary());
    }
}
