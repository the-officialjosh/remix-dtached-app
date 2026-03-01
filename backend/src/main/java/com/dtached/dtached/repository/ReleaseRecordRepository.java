package com.dtached.dtached.repository;

import com.dtached.dtached.model.ReleaseRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReleaseRecordRepository extends JpaRepository<ReleaseRecord, Long> {
    List<ReleaseRecord> findByPlayerId(Long playerId);
    List<ReleaseRecord> findByTeamId(Long teamId);
}
