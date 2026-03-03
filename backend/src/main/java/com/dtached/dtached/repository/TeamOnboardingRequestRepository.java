package com.dtached.dtached.repository;

import com.dtached.dtached.model.TeamOnboardingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamOnboardingRequestRepository extends JpaRepository<TeamOnboardingRequest, Long> {
    List<TeamOnboardingRequest> findAllByOrderByCreatedAtDesc();
    List<TeamOnboardingRequest> findByStatus(String status);
}
