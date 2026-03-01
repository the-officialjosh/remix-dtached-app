package com.dtached.dtached.repository;

import com.dtached.dtached.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
    List<Payment> findByTeamId(Long teamId);
    Optional<Payment> findByStripeSessionId(String sessionId);
    List<Payment> findByStatus(String status);
    List<Payment> findByPaymentType(String paymentType);
}
