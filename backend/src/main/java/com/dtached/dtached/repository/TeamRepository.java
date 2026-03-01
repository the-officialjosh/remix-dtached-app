package com.dtached.dtached.repository;

import com.dtached.dtached.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByType(String type);
    List<Team> findByStatus(String status);
    Optional<Team> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
}
