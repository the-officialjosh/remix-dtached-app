package com.dtached.dtached.config;

import com.dtached.dtached.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthFilter jwtAuthFilter;
    private final Environment environment;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> {
                // Public endpoints
                auth.requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/leaderboard/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/teams/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/games/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/media/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/players/register").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/players/free-agents").permitAll()

                    // Admin endpoints — ADMIN only
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")

                    // Coach/Team Manager endpoints
                    .requestMatchers(HttpMethod.POST, "/api/teams/register").hasAnyRole("COACH", "TEAM_MANAGER")
                    .requestMatchers("/api/free-agents/**").hasAnyRole("COACH", "TEAM_MANAGER")
                    .requestMatchers(HttpMethod.POST, "/api/team-requests/**").hasAnyRole("COACH", "TEAM_MANAGER")
                    .requestMatchers(HttpMethod.PUT, "/api/my/team/**").hasAnyRole("COACH", "TEAM_MANAGER")
                    .requestMatchers(HttpMethod.POST, "/api/players/confirm-jersey").hasAnyRole("COACH", "TEAM_MANAGER")

                    // Staff endpoints
                    .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "COACH", "TEAM_MANAGER")

                    // Invite endpoints
                    .requestMatchers(HttpMethod.POST, "/api/teams/*/invite").hasAnyRole("COACH", "TEAM_MANAGER")
                    .requestMatchers(HttpMethod.GET, "/api/teams/*/invites").hasAnyRole("COACH", "TEAM_MANAGER")
                    .requestMatchers(HttpMethod.GET, "/api/invites/*/accept").authenticated()

                    // Team needs
                    .requestMatchers(HttpMethod.GET, "/api/teams/*/needs").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/teams/*/needs").hasAnyRole("COACH", "TEAM_MANAGER")
                    .requestMatchers(HttpMethod.DELETE, "/api/team-needs/**").hasAnyRole("COACH", "TEAM_MANAGER", "ADMIN")

                    // Player verify
                    .requestMatchers(HttpMethod.POST, "/api/players/verify").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/players/me/free-agent").hasRole("PLAYER")

                    // Matching — interest endpoints
                    .requestMatchers(HttpMethod.POST, "/api/interests/team/*/player/*").hasAnyRole("COACH", "TEAM_MANAGER")
                    .requestMatchers(HttpMethod.POST, "/api/interests/player/team/*").hasRole("PLAYER")
                    .requestMatchers(HttpMethod.GET, "/api/interests/my").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/interests/team/*").hasAnyRole("COACH", "TEAM_MANAGER")

                    // Payments
                    .requestMatchers(HttpMethod.POST, "/api/payments/webhook").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/payments/tiers").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/payments/checkout/**").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/payments/my").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/payments/admin/**").hasRole("ADMIN")

                    // Transfers
                    .requestMatchers(HttpMethod.POST, "/api/transfers").hasRole("PLAYER")

                    // Swagger / OpenAPI
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                    // Actuator — only health endpoint is public
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/actuator/**").hasRole("ADMIN");

                // H2 Console — dev profile only
                if (Arrays.asList(environment.getActiveProfiles()).contains("dev")) {
                    auth.requestMatchers("/h2-console/**").permitAll();
                }

                // Everything else requires auth
                auth.anyRequest().authenticated();
            })
            // Wire JWT filter before Spring's auth filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // H2 console frames — dev only
        if (Arrays.asList(environment.getActiveProfiles()).contains("dev")) {
            http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));
        }

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
