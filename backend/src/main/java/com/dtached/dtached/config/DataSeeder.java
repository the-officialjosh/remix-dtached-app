package com.dtached.dtached.config;

import com.dtached.dtached.model.*;
import com.dtached.dtached.model.enums.TeamStaffRole;
import com.dtached.dtached.model.enums.UserRole;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamStaffRepository teamStaffRepository;
    private final PlayerRepository playerRepository;
    private final GameRepository gameRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (teamRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("Seeding database with test data...");

        // --- Users (coaches) ---
        User coach1 = userRepository.save(User.builder()
                .email("coach.carter@dtached.com").passwordHash(passwordEncoder.encode("password"))
                .firstName("Coach").lastName("Carter").role(UserRole.COACH).build());
        User coach2 = userRepository.save(User.builder()
                .email("coach.prime@dtached.com").passwordHash(passwordEncoder.encode("password"))
                .firstName("Coach").lastName("Prime").role(UserRole.COACH).build());
        User coach3 = userRepository.save(User.builder()
                .email("coach.sarah@dtached.com").passwordHash(passwordEncoder.encode("password"))
                .firstName("Coach").lastName("Sarah").role(UserRole.COACH).build());
        User coach4 = userRepository.save(User.builder()
                .email("coach.kelly@dtached.com").passwordHash(passwordEncoder.encode("password"))
                .firstName("Coach").lastName("Kelly").role(UserRole.COACH).build());

        // --- Admin user ---
        userRepository.save(User.builder()
                .email("admin@dtached.com").passwordHash(passwordEncoder.encode("admin123"))
                .firstName("Admin").lastName("Dtached").role(UserRole.ADMIN).build());

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
    }
}
