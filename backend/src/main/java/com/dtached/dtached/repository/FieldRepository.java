package com.dtached.dtached.repository;

import com.dtached.dtached.model.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldRepository extends JpaRepository<Field, Long> {
    List<Field> findByEventId(Long eventId);
}
