package com.dtached.dtached.service;

import com.dtached.dtached.dto.UpdateProfileRequest;
import com.dtached.dtached.dto.UserProfileDTO;
import com.dtached.dtached.model.Player;
import com.dtached.dtached.model.User;
import com.dtached.dtached.model.enums.UserRole;
import com.dtached.dtached.repository.PlayerRepository;
import com.dtached.dtached.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;

    public UserProfileDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDTO.UserProfileDTOBuilder builder = UserProfileDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .photoUrl(user.getPhotoUrl())
                .emailConfirmed(user.getEmailConfirmed())
                .hasPlayerProfile(false);

        // Attach player data if linked
        playerRepository.findByUserId(user.getId()).ifPresent(player -> {
            builder.playerId(player.getId())
                    .position(player.getPosition())
                    .height(player.getHeight())
                    .weight(player.getWeight())
                    .city(player.getCity())
                    .province(player.getProvinceState())
                    .jerseyNumber(player.getNumber())
                    .status(player.getStatus())
                    .teamName(player.getTeam() != null ? player.getTeam().getName() : null)
                    .dob(player.getDob())
                    .gender(player.getGender())
                    .isVerified(player.getIsVerified())
                    .hasPlayerProfile(true)
                    .bio(player.getBio());
        });

        return builder.build();
    }

    @Transactional
    public UserProfileDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user fields
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) user.setLastName(request.getLastName().trim());
        if (request.getPhotoUrl() != null) user.setPhotoUrl(request.getPhotoUrl());
        userRepository.save(user);

        // Find or create player record (auto-create for PLAYER role)
        Player player = playerRepository.findByUserId(user.getId()).orElse(null);
        if (player == null && user.getRole() == UserRole.PLAYER) {
            player = Player.builder()
                    .user(user)
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .status("FREE_AGENT")
                    .isVerified(false)
                    .build();
        }

        if (player != null) {
            if (request.getFirstName() != null) player.setFirstName(request.getFirstName().trim());
            if (request.getLastName() != null) player.setLastName(request.getLastName().trim());
            if (request.getPosition() != null) player.setPosition(request.getPosition());
            if (request.getHeight() != null) player.setHeight(request.getHeight());
            if (request.getWeight() != null) player.setWeight(request.getWeight());
            if (request.getPhotoUrl() != null) player.setPhotoUrl(request.getPhotoUrl());
            if (request.getCity() != null) player.setCity(request.getCity());
            if (request.getProvince() != null) player.setProvinceState(request.getProvince());
            if (request.getJerseyNumber() != null) player.setNumber(request.getJerseyNumber());
            if (request.getDob() != null) player.setDob(request.getDob());
            if (request.getGender() != null) player.setGender(request.getGender());
            if (request.getBio() != null) player.setBio(request.getBio());
            playerRepository.save(player);
        }

        return getProfile(email);
    }
}

