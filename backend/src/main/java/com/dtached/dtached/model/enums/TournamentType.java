package com.dtached.dtached.model.enums;

public enum TournamentType {
    SEVEN_V_SEVEN("7v7"),
    FLAG("Flag");

    private final String value;

    TournamentType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
