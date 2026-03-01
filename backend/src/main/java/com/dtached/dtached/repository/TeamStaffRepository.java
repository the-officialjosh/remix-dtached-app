package com.dtached.dtached.repository;

import com.dtached.dtached.model.TeamStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamStaffRepository extends JpaRepository<TeamStaff, Long> {
    List<TeamStaff> findByTeamId(Long teamId);
    List<TeamStaff> findByUserId(Long userId);
    Optional<TeamStaff> findByUserIdAndTeamId(Long userId, Long teamId);
}
