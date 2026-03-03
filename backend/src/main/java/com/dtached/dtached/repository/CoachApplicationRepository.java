package com.dtached.dtached.repository;

import com.dtached.dtached.model.CoachApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoachApplicationRepository extends JpaRepository<CoachApplication, Long> {
    Optional<CoachApplication> findByUserId(Long userId);
    Optional<CoachApplication> findByEmail(String email);
    List<CoachApplication> findByStatus(String status);
    List<CoachApplication> findAllByOrderByCreatedAtDesc();
}
