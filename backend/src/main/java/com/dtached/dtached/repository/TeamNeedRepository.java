package com.dtached.dtached.repository;

import com.dtached.dtached.model.TeamNeed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamNeedRepository extends JpaRepository<TeamNeed, Long> {
    List<TeamNeed> findByTeamId(Long teamId);
}
