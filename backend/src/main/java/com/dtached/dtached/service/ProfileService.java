package com.dtached.dtached.service;

import com.dtached.dtached.dto.UpdateProfileRequest;
import com.dtached.dtached.dto.UserProfileDTO;
import com.dtached.dtached.model.Player;
import com.dtached.dtached.model.User;
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
                .emailConfirmed(user.getEmailConfirmed());

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
                    .teamName(player.getTeam() != null ? player.getTeam().getName() : null);
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

        // Update linked player fields (if player exists)
        playerRepository.findByUserId(user.getId()).ifPresent(player -> {
            if (request.getPosition() != null) player.setPosition(request.getPosition());
            if (request.getHeight() != null) player.setHeight(request.getHeight());
            if (request.getWeight() != null) player.setWeight(request.getWeight());
            if (request.getCity() != null) player.setCity(request.getCity());
            if (request.getProvince() != null) player.setProvinceState(request.getProvince());
            if (request.getJerseyNumber() != null) player.setNumber(request.getJerseyNumber());
            playerRepository.save(player);
        });

        return getProfile(email);
    }
}
