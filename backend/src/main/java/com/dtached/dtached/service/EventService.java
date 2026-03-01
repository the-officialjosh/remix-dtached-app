package com.dtached.dtached.service;

import com.dtached.dtached.model.*;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventDivisionRepository divisionRepository;
    private final EventRegistrationRepository registrationRepository;
    private final FieldRepository fieldRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final EventPackageRepository packageRepository;
    private final PlayerEventRegistrationRepository playerRegRepository;
    private final PlayerRepository playerRepository;

    // ========== EVENTS ==========

    public List<Map<String, Object>> getAllEvents() {
        return eventRepository.findAllByOrderByStartDateDesc().stream()
                .map(this::toEventMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPublishedEvents() {
        return eventRepository.findByStatusOrderByStartDateAsc("PUBLISHED").stream()
                .map(this::toEventMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getEvent(Long id) {
        TournamentEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        Map<String, Object> map = toEventMap(event);
        map.put("divisions", divisionRepository.findByEventId(id).stream()
                .map(this::toDivisionMap).collect(Collectors.toList()));
        map.put("fields", fieldRepository.findByEventId(id).stream()
                .map(this::toFieldMap).collect(Collectors.toList()));
        map.put("registrations", registrationRepository.findByEventId(id).stream()
                .map(this::toRegistrationMap).collect(Collectors.toList()));
        map.put("packages", packageRepository.findByEventIdOrderBySortOrderAsc(id).stream()
                .map(this::toPackageMap).collect(Collectors.toList()));
        map.put("playerRegistrations", playerRegRepository.findByEventId(id).stream()
                .map(this::toPlayerRegMap).collect(Collectors.toList()));
        map.put("registeredTeams", registrationRepository.countByEventId(id));
        map.put("registeredPlayers", playerRegRepository.countByEventId(id));
        return map;
    }

    @Transactional
    public Map<String, Object> createEvent(Map<String, Object> body) {
        TournamentEvent event = TournamentEvent.builder()
                .name((String) body.get("name"))
                .description((String) body.get("description"))
                .location((String) body.get("location"))
                .address((String) body.get("address"))
                .city((String) body.get("city"))
                .provinceState((String) body.get("provinceState"))
                .startDate(java.time.LocalDate.parse((String) body.get("startDate")))
                .endDate(java.time.LocalDate.parse((String) body.get("endDate")))
                .registrationDeadline(body.get("registrationDeadline") != null
                        ? java.time.LocalDate.parse((String) body.get("registrationDeadline")) : null)
                .format((String) body.getOrDefault("format", "7v7"))
                .status((String) body.getOrDefault("status", "DRAFT"))
                .eventType((String) body.getOrDefault("eventType", "TOURNAMENT"))
                .maxTeams(body.get("maxTeams") != null ? ((Number) body.get("maxTeams")).intValue() : null)
                .entryFee(body.get("entryFee") != null
                        ? new java.math.BigDecimal(body.get("entryFee").toString()) : null)
                .bannerUrl((String) body.get("bannerUrl"))
                .requiredFields((String) body.get("requiredFields"))
                .build();
        return toEventMap(eventRepository.save(event));
    }

    @Transactional
    public Map<String, Object> updateEvent(Long id, Map<String, Object> body) {
        TournamentEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (body.containsKey("name")) event.setName((String) body.get("name"));
        if (body.containsKey("description")) event.setDescription((String) body.get("description"));
        if (body.containsKey("location")) event.setLocation((String) body.get("location"));
        if (body.containsKey("address")) event.setAddress((String) body.get("address"));
        if (body.containsKey("city")) event.setCity((String) body.get("city"));
        if (body.containsKey("provinceState")) event.setProvinceState((String) body.get("provinceState"));
        if (body.containsKey("startDate")) event.setStartDate(java.time.LocalDate.parse((String) body.get("startDate")));
        if (body.containsKey("endDate")) event.setEndDate(java.time.LocalDate.parse((String) body.get("endDate")));
        if (body.containsKey("registrationDeadline")) event.setRegistrationDeadline(
                body.get("registrationDeadline") != null ? java.time.LocalDate.parse((String) body.get("registrationDeadline")) : null);
        if (body.containsKey("format")) event.setFormat((String) body.get("format"));
        if (body.containsKey("status")) event.setStatus((String) body.get("status"));
        if (body.containsKey("eventType")) event.setEventType((String) body.get("eventType"));
        if (body.containsKey("maxTeams")) event.setMaxTeams(body.get("maxTeams") != null ? ((Number) body.get("maxTeams")).intValue() : null);
        if (body.containsKey("entryFee")) event.setEntryFee(body.get("entryFee") != null
                ? new java.math.BigDecimal(body.get("entryFee").toString()) : null);
        if (body.containsKey("bannerUrl")) event.setBannerUrl((String) body.get("bannerUrl"));
        if (body.containsKey("requiredFields")) event.setRequiredFields((String) body.get("requiredFields"));

        return toEventMap(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    // ========== DIVISIONS ==========

    @Transactional
    public Map<String, Object> addDivision(Long eventId, Map<String, Object> body) {
        TournamentEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        EventDivision div = EventDivision.builder()
                .event(event)
                .name((String) body.get("name"))
                .ageGroup((String) body.get("ageGroup"))
                .maxTeams(body.get("maxTeams") != null ? ((Number) body.get("maxTeams")).intValue() : null)
                .format((String) body.get("format"))
                .build();
        return toDivisionMap(divisionRepository.save(div));
    }

    @Transactional
    public void deleteDivision(Long divisionId) {
        divisionRepository.deleteById(divisionId);
    }

    // ========== TEAM REGISTRATIONS ==========

    @Transactional
    public Map<String, Object> registerTeam(Long eventId, String coachEmail, Map<String, Object> body) {
        TournamentEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!"PUBLISHED".equals(event.getStatus())) {
            throw new RuntimeException("Event is not open for registration");
        }

        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long teamId = ((Number) body.get("teamId")).longValue();
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        registrationRepository.findByEventIdAndTeamId(eventId, teamId).ifPresent(r -> {
            throw new RuntimeException("Team is already registered for this event");
        });

        if (event.getMaxTeams() != null) {
            long current = registrationRepository.countByEventId(eventId);
            if (current >= event.getMaxTeams()) {
                throw new RuntimeException("Event has reached maximum team capacity");
            }
        }

        Long divisionId = body.get("divisionId") != null ? ((Number) body.get("divisionId")).longValue() : null;
        EventDivision division = divisionId != null ? divisionRepository.findById(divisionId).orElse(null) : null;

        EventRegistration reg = EventRegistration.builder()
                .event(event)
                .division(division)
                .team(team)
                .status("PENDING")
                .notes((String) body.get("notes"))
                .build();

        return toRegistrationMap(registrationRepository.save(reg));
    }

    @Transactional
    public Map<String, Object> updateRegistrationStatus(Long registrationId, String status) {
        EventRegistration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus(status);
        return toRegistrationMap(registrationRepository.save(reg));
    }

    // ========== PLAYER REGISTRATIONS ==========

    @Transactional
    public Map<String, Object> registerPlayer(Long eventId, String email, Map<String, Object> body) {
        TournamentEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!"PUBLISHED".equals(event.getStatus())) {
            throw new RuntimeException("Event is not open for registration");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        playerRegRepository.findByEventIdAndUserId(eventId, user.getId()).ifPresent(r -> {
            throw new RuntimeException("You are already registered for this event");
        });

        Player player = playerRepository.findByUserId(user.getId()).orElse(null);

        Long divisionId = body.get("divisionId") != null ? ((Number) body.get("divisionId")).longValue() : null;
        EventDivision division = divisionId != null ? divisionRepository.findById(divisionId).orElse(null) : null;

        Long packageId = body.get("packageId") != null ? ((Number) body.get("packageId")).longValue() : null;
        EventPackage pkg = packageId != null ? packageRepository.findById(packageId).orElse(null) : null;

        PlayerEventRegistration reg = PlayerEventRegistration.builder()
                .event(event)
                .player(player)
                .user(user)
                .division(division)
                .eventPackage(pkg)
                .status("PENDING")
                .jerseySize((String) body.get("jerseySize"))
                .shortsSize((String) body.get("shortsSize"))
                .teamName((String) body.get("teamName"))
                .category((String) body.get("category"))
                .hasTeam(body.get("hasTeam") != null ? (Boolean) body.get("hasTeam") : false)
                .videoUrl((String) body.get("videoUrl"))
                .paymentStatus((String) body.getOrDefault("paymentStatus", "UNPAID"))
                .notes((String) body.get("notes"))
                .build();

        return toPlayerRegMap(playerRegRepository.save(reg));
    }

    @Transactional
    public Map<String, Object> updatePlayerRegStatus(Long regId, String status) {
        PlayerEventRegistration reg = playerRegRepository.findById(regId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus(status);
        return toPlayerRegMap(playerRegRepository.save(reg));
    }

    public List<Map<String, Object>> getMyRegistrations(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return List.of();
        return playerRegRepository.findByUserId(user.getId()).stream()
                .map(this::toPlayerRegMap)
                .collect(Collectors.toList());
    }

    // ========== PACKAGES ==========

    public List<Map<String, Object>> getPackages(Long eventId) {
        return packageRepository.findByEventIdOrderBySortOrderAsc(eventId).stream()
                .map(this::toPackageMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> addPackage(Long eventId, Map<String, Object> body) {
        TournamentEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        EventPackage pkg = EventPackage.builder()
                .event(event)
                .name((String) body.get("name"))
                .price(new java.math.BigDecimal(body.get("price").toString()))
                .description((String) body.get("description"))
                .includes((String) body.get("includes"))
                .isDefault(body.get("isDefault") != null ? (Boolean) body.get("isDefault") : false)
                .sortOrder(body.get("sortOrder") != null ? ((Number) body.get("sortOrder")).intValue() : 0)
                .build();
        return toPackageMap(packageRepository.save(pkg));
    }

    @Transactional
    public void deletePackage(Long packageId) {
        packageRepository.deleteById(packageId);
    }

    // ========== FIELDS ==========

    @Transactional
    public Map<String, Object> addField(Long eventId, Map<String, Object> body) {
        TournamentEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        Field field = Field.builder()
                .event(event)
                .name((String) body.get("name"))
                .location((String) body.get("location"))
                .capacity(body.get("capacity") != null ? ((Number) body.get("capacity")).intValue() : null)
                .surfaceType((String) body.getOrDefault("surfaceType", "GRASS"))
                .build();
        return toFieldMap(fieldRepository.save(field));
    }

    @Transactional
    public void deleteField(Long fieldId) {
        fieldRepository.deleteById(fieldId);
    }

    // ========== MAPPERS ==========

    private Map<String, Object> toEventMap(TournamentEvent e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", e.getId());
        m.put("name", e.getName());
        m.put("description", e.getDescription());
        m.put("location", e.getLocation());
        m.put("address", e.getAddress());
        m.put("city", e.getCity());
        m.put("provinceState", e.getProvinceState());
        m.put("startDate", e.getStartDate() != null ? e.getStartDate().toString() : null);
        m.put("endDate", e.getEndDate() != null ? e.getEndDate().toString() : null);
        m.put("registrationDeadline", e.getRegistrationDeadline() != null ? e.getRegistrationDeadline().toString() : null);
        m.put("format", e.getFormat());
        m.put("status", e.getStatus());
        m.put("eventType", e.getEventType());
        m.put("maxTeams", e.getMaxTeams());
        m.put("entryFee", e.getEntryFee());
        m.put("bannerUrl", e.getBannerUrl());
        m.put("requiredFields", e.getRequiredFields());
        m.put("createdAt", e.getCreatedAt() != null ? e.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> toDivisionMap(EventDivision d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("eventId", d.getEvent().getId());
        m.put("name", d.getName());
        m.put("ageGroup", d.getAgeGroup());
        m.put("maxTeams", d.getMaxTeams());
        m.put("format", d.getFormat());
        return m;
    }

    private Map<String, Object> toRegistrationMap(EventRegistration r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("eventId", r.getEvent().getId());
        m.put("eventName", r.getEvent().getName());
        m.put("divisionId", r.getDivision() != null ? r.getDivision().getId() : null);
        m.put("divisionName", r.getDivision() != null ? r.getDivision().getName() : null);
        m.put("teamId", r.getTeam().getId());
        m.put("teamName", r.getTeam().getName());
        m.put("status", r.getStatus());
        m.put("rosterLocked", r.getRosterLocked());
        m.put("notes", r.getNotes());
        m.put("registeredAt", r.getRegisteredAt() != null ? r.getRegisteredAt().toString() : null);
        return m;
    }

    private Map<String, Object> toPackageMap(EventPackage p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("eventId", p.getEvent().getId());
        m.put("name", p.getName());
        m.put("price", p.getPrice());
        m.put("description", p.getDescription());
        m.put("includes", p.getIncludes());
        m.put("isDefault", p.getIsDefault());
        m.put("sortOrder", p.getSortOrder());
        return m;
    }

    private Map<String, Object> toPlayerRegMap(PlayerEventRegistration r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("eventId", r.getEvent().getId());
        m.put("eventName", r.getEvent().getName());
        m.put("userId", r.getUser() != null ? r.getUser().getId() : null);
        m.put("userName", r.getUser() != null ? r.getUser().getFirstName() + " " + r.getUser().getLastName() : null);
        m.put("divisionId", r.getDivision() != null ? r.getDivision().getId() : null);
        m.put("divisionName", r.getDivision() != null ? r.getDivision().getName() : null);
        m.put("packageId", r.getEventPackage() != null ? r.getEventPackage().getId() : null);
        m.put("packageName", r.getEventPackage() != null ? r.getEventPackage().getName() : null);
        m.put("status", r.getStatus());
        m.put("jerseySize", r.getJerseySize());
        m.put("shortsSize", r.getShortsSize());
        m.put("teamName", r.getTeamName());
        m.put("category", r.getCategory());
        m.put("hasTeam", r.getHasTeam());
        m.put("videoUrl", r.getVideoUrl());
        m.put("paymentStatus", r.getPaymentStatus());
        m.put("registeredAt", r.getRegisteredAt() != null ? r.getRegisteredAt().toString() : null);
        return m;
    }

    private Map<String, Object> toFieldMap(Field f) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", f.getId());
        m.put("name", f.getName());
        m.put("location", f.getLocation());
        m.put("gpsLat", f.getGpsLat());
        m.put("gpsLng", f.getGpsLng());
        m.put("capacity", f.getCapacity());
        m.put("surfaceType", f.getSurfaceType());
        m.put("status", f.getStatus());
        return m;
    }
}
