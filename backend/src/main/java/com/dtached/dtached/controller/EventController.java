package com.dtached.dtached.controller;

import com.dtached.dtached.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // ========== PUBLIC ==========

    @GetMapping("/published")
    public ResponseEntity<List<Map<String, Object>>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.getPublishedEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEvent(id));
    }

    // ========== ADMIN ==========

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateEvent(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(eventService.updateEvent(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // ========== DIVISIONS ==========

    @PostMapping("/{eventId}/divisions")
    public ResponseEntity<Map<String, Object>> addDivision(@PathVariable Long eventId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.addDivision(eventId, body));
    }

    @DeleteMapping("/divisions/{divisionId}")
    public ResponseEntity<Void> deleteDivision(@PathVariable Long divisionId) {
        eventService.deleteDivision(divisionId);
        return ResponseEntity.noContent().build();
    }

    // ========== REGISTRATIONS ==========

    @PostMapping("/{eventId}/register")
    public ResponseEntity<Map<String, Object>> registerTeam(
            @PathVariable Long eventId,
            Authentication authentication,
            @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.registerTeam(eventId, authentication.getName(), body));
    }

    @PutMapping("/registrations/{registrationId}/status")
    public ResponseEntity<Map<String, Object>> updateRegistrationStatus(
            @PathVariable Long registrationId,
            @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(eventService.updateRegistrationStatus(registrationId, (String) body.get("status")));
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<List<Map<String, Object>>> getMyRegistrations(Authentication authentication) {
        // This would need the team lookup — for now return empty
        return ResponseEntity.ok(List.of());
    }

    // ========== FIELDS ==========

    @PostMapping("/{eventId}/fields")
    public ResponseEntity<Map<String, Object>> addField(@PathVariable Long eventId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.addField(eventId, body));
    }

    @DeleteMapping("/fields/{fieldId}")
    public ResponseEntity<Void> deleteField(@PathVariable Long fieldId) {
        eventService.deleteField(fieldId);
        return ResponseEntity.noContent().build();
    }
}
