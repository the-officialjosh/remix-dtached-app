package com.dtached.dtached.repository;

import com.dtached.dtached.model.EventPackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventPackageRepository extends JpaRepository<EventPackage, Long> {
    List<EventPackage> findByEventIdOrderBySortOrderAsc(Long eventId);
}
