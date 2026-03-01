package com.dtached.dtached.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
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
            });

        // H2 console frames — dev only
        if (Arrays.asList(environment.getActiveProfiles()).contains("dev")) {
            http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));
        }

        // JWT filter will be added here in Phase 3
        // http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
