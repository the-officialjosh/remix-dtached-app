package com.dtached.dtached.repository;

import com.dtached.dtached.model.CoachApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoachApplicationRepository extends JpaRepository<CoachApplication, Long> {
    Optional<CoachApplication> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<CoachApplication> findByStatusOrderByCreatedAtDesc(String status);
    List<CoachApplication> findAllByOrderByCreatedAtDesc();
}
