package com.dtached.dtached.service;

import com.dtached.dtached.dto.MediaDTO;
import com.dtached.dtached.mapper.MediaMapper;
import com.dtached.dtached.model.Game;
import com.dtached.dtached.model.Media;
import com.dtached.dtached.model.User;
import com.dtached.dtached.repository.GameRepository;
import com.dtached.dtached.repository.MediaRepository;
import com.dtached.dtached.repository.PlayerRepository;
import com.dtached.dtached.repository.TeamRepository;
import com.dtached.dtached.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final GameRepository gameRepository;
    private final MediaRepository mediaRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final MediaMapper mediaMapper;

    /**
     * Update livestream URL and live scores for a game.
     */
    @Transactional
    public void updateLivestream(Long gameId, Map<String, Object> data) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (data.containsKey("streamUrl")) {
            game.setStreamUrl((String) data.get("streamUrl"));
        }
        if (data.containsKey("status")) {
            game.setStatus((String) data.get("status"));
        }
        if (data.containsKey("homeScore")) {
            game.setHomeScore((Integer) data.get("homeScore"));
        }
        if (data.containsKey("awayScore")) {
            game.setAwayScore((Integer) data.get("awayScore"));
        }
        if (data.containsKey("possessionTeamId")) {
            game.setPossessionTeamId(Long.valueOf(data.get("possessionTeamId").toString()));
        }
        if (data.containsKey("currentDown")) {
            game.setCurrentDown((Integer) data.get("currentDown"));
        }
        if (data.containsKey("distance")) {
            game.setDistance((String) data.get("distance"));
        }
        if (data.containsKey("yardLine")) {
            game.setYardLine((String) data.get("yardLine"));
        }

        gameRepository.save(game);
    }

    /**
     * Upload media (photo/video URL) linked to player and/or team.
     */
    @Transactional
    public MediaDTO uploadMedia(String email, Map<String, Object> data) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Media.MediaBuilder builder = Media.builder()
                .url((String) data.get("url"))
                .type(data.getOrDefault("type", "photo").toString())
                .isPremium(Boolean.valueOf(data.getOrDefault("isPremium", false).toString()))
                .uploadedBy(user);

        if (data.containsKey("playerId")) {
            Long playerId = Long.valueOf(data.get("playerId").toString());
            builder.player(playerRepository.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found")));
        }
        if (data.containsKey("teamId")) {
            Long teamId = Long.valueOf(data.get("teamId").toString());
            builder.team(teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found")));
        }

        Media media = mediaRepository.save(builder.build());
        return mediaMapper.toDTO(media);
    }
}
