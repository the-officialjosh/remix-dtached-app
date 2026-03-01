package com.dtached.dtached.controller;

import com.dtached.dtached.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // ========== PUBLIC ==========

    @GetMapping("/published")
    public ResponseEntity<?> getPublishedEvents() {
        return ResponseEntity.ok(eventService.getPublishedEvents());
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<?> getEvent(@PathVariable Long eventId) {
        try {
            return ResponseEntity.ok(eventService.getEvent(eventId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{eventId}/packages")
    public ResponseEntity<?> getPackages(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getPackages(eventId));
    }

    // ========== ADMIN: EVENTS ==========

    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(eventService.createEvent(body));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<?> updateEvent(@PathVariable Long eventId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(eventService.updateEvent(eventId, body));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok(Map.of("message", "Event deleted"));
    }

    // ========== ADMIN: DIVISIONS ==========

    @PostMapping("/{eventId}/divisions")
    public ResponseEntity<?> addDivision(@PathVariable Long eventId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(eventService.addDivision(eventId, body));
    }

    @DeleteMapping("/divisions/{divisionId}")
    public ResponseEntity<?> deleteDivision(@PathVariable Long divisionId) {
        eventService.deleteDivision(divisionId);
        return ResponseEntity.ok(Map.of("message", "Division deleted"));
    }

    // ========== ADMIN: PACKAGES ==========

    @PostMapping("/{eventId}/packages")
    public ResponseEntity<?> addPackage(@PathVariable Long eventId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(eventService.addPackage(eventId, body));
    }

    @DeleteMapping("/packages/{packageId}")
    public ResponseEntity<?> deletePackage(@PathVariable Long packageId) {
        eventService.deletePackage(packageId);
        return ResponseEntity.ok(Map.of("message", "Package deleted"));
    }

    // ========== ADMIN: FIELDS ==========

    @PostMapping("/{eventId}/fields")
    public ResponseEntity<?> addField(@PathVariable Long eventId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(eventService.addField(eventId, body));
    }

    @DeleteMapping("/fields/{fieldId}")
    public ResponseEntity<?> deleteField(@PathVariable Long fieldId) {
        eventService.deleteField(fieldId);
        return ResponseEntity.ok(Map.of("message", "Field deleted"));
    }

    // ========== TEAM REGISTRATION ==========

    @PostMapping("/{eventId}/register")
    public ResponseEntity<?> registerTeam(@PathVariable Long eventId, Authentication auth, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(eventService.registerTeam(eventId, auth.getName(), body));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/registrations/{registrationId}/status")
    public ResponseEntity<?> updateRegistrationStatus(@PathVariable Long registrationId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(eventService.updateRegistrationStatus(registrationId, (String) body.get("status")));
    }

    // ========== PLAYER REGISTRATION ==========

    @PostMapping("/{eventId}/register/player")
    public ResponseEntity<?> registerPlayer(@PathVariable Long eventId, Authentication auth, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(eventService.registerPlayer(eventId, auth.getName(), body));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/player-registrations/{regId}/status")
    public ResponseEntity<?> updatePlayerRegStatus(@PathVariable Long regId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(eventService.updatePlayerRegStatus(regId, (String) body.get("status")));
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<?> getMyRegistrations(Authentication auth) {
        return ResponseEntity.ok(eventService.getMyRegistrations(auth.getName()));
    }
}
