package com.dtached.dtached.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TeamDTO {
    private Long id;
    private String name;
    private String type;
    private String division;
    private String logo;
    private String coachName;
    private String coachPhoto;
    private Integer gp;
    private Integer wins;
    private Integer losses;
    private Integer ties;
    private Integer pts;
    private Integer pf;
    private Integer pa;
    private Integer pd;
    private String l5;
    private String city;
    private String provinceState;
    private String bio;
    private List<PlayerDTO> roster;
}
