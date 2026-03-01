package com.dtached.dtached.config;

import com.dtached.dtached.model.*;
import com.dtached.dtached.model.enums.TeamStaffRole;
import com.dtached.dtached.model.enums.UserRole;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamStaffRepository teamStaffRepository;
    private final PlayerRepository playerRepository;
    private final GameRepository gameRepository;
    private final EventRepository eventRepository;
    private final EventDivisionRepository eventDivisionRepository;
    private final EventPackageRepository eventPackageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (teamRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("Seeding database with test data...");

        // --- Users (coaches) ---
        User coach1 = userRepository.save(User.builder()
                .email("coach.carter@dtached.com").passwordHash(passwordEncoder.encode("password123"))
                .firstName("Coach").lastName("Carter").role(UserRole.COACH).emailConfirmed(true).build());
        User coach2 = userRepository.save(User.builder()
                .email("coach.prime@dtached.com").passwordHash(passwordEncoder.encode("password123"))
                .firstName("Coach").lastName("Prime").role(UserRole.COACH).emailConfirmed(true).build());
        User coach3 = userRepository.save(User.builder()
                .email("coach.sarah@dtached.com").passwordHash(passwordEncoder.encode("password123"))
                .firstName("Coach").lastName("Sarah").role(UserRole.COACH).emailConfirmed(true).build());
        User coach4 = userRepository.save(User.builder()
                .email("coach.kelly@dtached.com").passwordHash(passwordEncoder.encode("password123"))
                .firstName("Coach").lastName("Kelly").role(UserRole.COACH).emailConfirmed(true).build());

        // --- Admin user ---
        User admin = userRepository.save(User.builder()
                .email("admin@dtached.com").passwordHash(passwordEncoder.encode("password123"))
                .firstName("Admin").lastName("Dtached").role(UserRole.ADMIN).emailConfirmed(true).build());

        // --- Player user ---
        User playerUser = userRepository.save(User.builder()
                .email("player@dtached.com").passwordHash(passwordEncoder.encode("password123"))
                .firstName("Player").lastName("Demo").role(UserRole.PLAYER).emailConfirmed(true).build());

        // --- Team Manager user ---
        userRepository.save(User.builder()
                .email("manager@dtached.com").passwordHash(passwordEncoder.encode("password123"))
                .firstName("Manager").lastName("Demo").role(UserRole.TEAM_MANAGER).emailConfirmed(true).build());

        // --- Staff user ---
        userRepository.save(User.builder()
                .email("staff@dtached.com").passwordHash(passwordEncoder.encode("password123"))
                .firstName("Staff").lastName("Demo").role(UserRole.STAFF).emailConfirmed(true).build());

        // --- Teams ---
        Team titans = teamRepository.save(Team.builder()
                .name("Titans").type("7v7").division("Elite").status("APPROVED").inviteCode("TITAN2026")
                .city("Toronto").provinceState("ON")
                .bio("The Titans are a premier 7v7 program focused on developing elite skill position players.")
                .gp(5).wins(4).losses(1).ties(0).pts(8).pf(120).pa(85).pd(35).l5("W-W-L-W-W").build());

        Team warriors = teamRepository.save(Team.builder()
                .name("Warriors").type("7v7").division("16U").status("APPROVED").inviteCode("WARR2026")
                .city("Hamilton").provinceState("ON")
                .bio("Building champions on and off the field through discipline and hard work.")
                .gp(5).wins(3).losses(2).ties(0).pts(6).pf(110).pa(95).pd(15).l5("L-W-W-L-W").build());

        Team valkyries = teamRepository.save(Team.builder()
                .name("Valkyries").type("Flag").division("Elite").status("APPROVED").inviteCode("VALK2026")
                .city("Ottawa").provinceState("ON")
                .bio("The Valkyries represent the next generation of female athletes in competitive flag football.")
                .gp(4).wins(4).losses(0).ties(0).pts(8).pf(90).pa(20).pd(70).l5("W-W-W-W").build());

        Team sirens = teamRepository.save(Team.builder()
                .name("Sirens").type("Flag").division("14U").status("APPROVED").inviteCode("SIRN2026")
                .city("Toronto").provinceState("ON")
                .bio("Fast, agile, and determined. The Sirens are making waves in the 14U division.")
                .gp(4).wins(2).losses(2).ties(0).pts(4).pf(60).pa(65).pd(-5).l5("L-W-L-W").build());

        // --- Team Staff ---
        teamStaffRepository.save(TeamStaff.builder().user(coach1).team(titans).role(TeamStaffRole.HEAD_COACH).build());
        teamStaffRepository.save(TeamStaff.builder().user(coach2).team(warriors).role(TeamStaffRole.HEAD_COACH).build());
        teamStaffRepository.save(TeamStaff.builder().user(coach3).team(valkyries).role(TeamStaffRole.HEAD_COACH).build());
        teamStaffRepository.save(TeamStaff.builder().user(coach4).team(sirens).role(TeamStaffRole.HEAD_COACH).build());

        // --- Players ---
        playerRepository.save(Player.builder()
                .firstName("John").lastName("Doe").team(titans).number(12).position("QB")
                .height("6'2\"").weight("210 lbs").city("Toronto").provinceState("ON")
                .dob("2008-03-15").gender("Boy").status("ON_TEAM").isVerified(true).jerseyConfirmed(true)
                .totalTouchdowns(3).totalPassYards(250).totalPassAttempts(30).totalPassCompletions(22)
                .eventType("tournament").planPackage("$90").build());

        playerRepository.save(Player.builder()
                .firstName("Mike").lastName("Smith").team(titans).number(88).position("WR")
                .height("6'0\"").weight("195 lbs").city("Hamilton").provinceState("ON")
                .dob("2009-07-22").gender("Boy").status("ON_TEAM").isVerified(true).jerseyConfirmed(true)
                .totalYards(180).totalCatches(12).totalTouchdowns(2)
                .eventType("tournament").planPackage("$90").build());

        playerRepository.save(Player.builder()
                .firstName("Sarah").lastName("Connor").team(valkyries).number(7).position("DB")
                .height("5'9\"").weight("160 lbs").city("Ottawa").provinceState("ON")
                .dob("2008-11-10").gender("Girl").status("ON_TEAM").isVerified(true).jerseyConfirmed(false)
                .totalYards(45).totalCatches(3).totalInterceptions(2).totalTouchdowns(1).totalSacks(4)
                .eventType("tournament").planPackage("$45").build());

        playerRepository.save(Player.builder()
                .firstName("Jane").lastName("Doe").team(sirens).number(10).position("WR")
                .height("5'7\"").weight("145 lbs").city("Toronto").provinceState("ON")
                .dob("2010-05-03").gender("Girl").status("ON_TEAM").isVerified(false).jerseyConfirmed(false)
                .totalYards(120).totalCatches(8).totalTouchdowns(2)
                .eventType("tournament").planPackage("$45").build());

        // --- Games ---
        gameRepository.save(Game.builder()
                .homeTeam(titans).awayTeam(warriors).field("Field 1").type("7v7")
                .startTime(LocalDateTime.now()).status("live")
                .homeScore(14).awayScore(7)
                .possessionTeamId(titans.getId()).currentDown(2).distance("7").yardLine("Opp 35").build());

        gameRepository.save(Game.builder()
                .homeTeam(valkyries).awayTeam(sirens).field("Field 3").type("Flag")
                .startTime(LocalDateTime.now().plusHours(1)).status("scheduled")
                .homeScore(0).awayScore(0).build());

        log.info("Database seeded: 5 users, 4 teams, 4 players, 2 games.");

        // --- Events (real details from translations.ts / HomePage) ---
        TournamentEvent camp = eventRepository.save(TournamentEvent.builder()
                .name("Camp Retour à l'Origine 2026")
                .description("5e Édition — A one-day intensive training camp focused on skill development, position coaching, and competitive drills. Open to all skill levels.")
                .location("Montréal")
                .city("Montréal").provinceState("QC")
                .startDate(LocalDate.of(2026, 6, 20))
                .endDate(LocalDate.of(2026, 6, 20))
                .registrationDeadline(LocalDate.of(2026, 6, 15))
                .format("7v7")
                .status("PUBLISHED")
                .eventType("CAMP")
                .requiredFields("[\"jersey_size\",\"shorts_size\"]")
                .maxTeams(16)
                .entryFee(BigDecimal.valueOf(100.00))
                .build());

        TournamentEvent tourney = eventRepository.save(TournamentEvent.builder()
                .name("Tournoi Dtached 2026")
                .description("7v7 Boys & Flag Girls — The premier weekend tournament featuring top teams from across Canada.")
                .location("Montréal")
                .city("Montréal").provinceState("QC")
                .startDate(LocalDate.of(2026, 6, 20))
                .endDate(LocalDate.of(2026, 6, 21))
                .registrationDeadline(LocalDate.of(2026, 6, 10))
                .format("7v7")
                .status("PUBLISHED")
                .eventType("TOURNAMENT")
                .requiredFields("[\"team_name\",\"category\",\"video_url\"]")
                .maxTeams(32)
                .entryFee(BigDecimal.valueOf(90.00))
                .build());

        // Divisions: 7v7 Boys & Flag Girls
        eventDivisionRepository.save(EventDivision.builder().event(camp).name("7v7 Boys").ageGroup("U18").maxTeams(8).build());
        eventDivisionRepository.save(EventDivision.builder().event(camp).name("Flag Girls").ageGroup("U18").maxTeams(8).build());
        eventDivisionRepository.save(EventDivision.builder().event(tourney).name("7v7 Boys").ageGroup("U18").maxTeams(16).build());
        eventDivisionRepository.save(EventDivision.builder().event(tourney).name("Flag Girls").ageGroup("U18").maxTeams(16).build());

        // Packages for camp
        eventPackageRepository.save(EventPackage.builder().event(camp).name("Camp Registration").price(BigDecimal.valueOf(100.00))
                .description("Camp Access + Jersey + Shorts + Gift Bag").includes("[\"Camp Access\",\"Jersey\",\"Shorts\",\"Gift Bag\"]").isDefault(true).sortOrder(0).build());

        // Packages for tournament
        eventPackageRepository.save(EventPackage.builder().event(tourney).name("Starter Pack").price(BigDecimal.valueOf(45.00))
                .description("Dtached Gloves + Admission").includes("[\"Dtached Gloves\",\"Admission\"]").sortOrder(0).build());
        eventPackageRepository.save(EventPackage.builder().event(tourney).name("Complete Pack").price(BigDecimal.valueOf(90.00))
                .description("Team Uniform + Dtached Gloves + Admission").includes("[\"Team Uniform\",\"Dtached Gloves\",\"Admission\"]").isDefault(true).sortOrder(1).build());

        log.info("Seeded 2 events with 4 divisions and 3 packages.");
    }
}

