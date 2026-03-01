package com.dtached.dtached.repository;

import com.dtached.dtached.model.TeamInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamInviteRepository extends JpaRepository<TeamInvite, Long> {
    Optional<TeamInvite> findByInviteCode(String inviteCode);
    List<TeamInvite> findByTeamId(Long teamId);
    List<TeamInvite> findByEmail(String email);
    List<TeamInvite> findByTeamIdAndStatus(Long teamId, String status);
}
