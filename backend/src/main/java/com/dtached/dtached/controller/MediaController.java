package com.dtached.dtached.controller;

import com.dtached.dtached.dto.MediaDTO;
import com.dtached.dtached.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @GetMapping("/media")
    public List<MediaDTO> getMedia(
            @RequestParam(required = false) Long player_id,
            @RequestParam(required = false) Long team_id
    ) {
        if (player_id != null) return mediaService.getByPlayerId(player_id);
        if (team_id != null) return mediaService.getByTeamId(team_id);
        return Collections.emptyList();
    }
}
