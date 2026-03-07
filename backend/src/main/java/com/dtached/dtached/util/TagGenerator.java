package com.dtached.dtached.util;

import java.security.SecureRandom;

public class TagGenerator {

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I, O, 1, 0 to avoid visual confusion
    private static final int TAG_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generate() {
        StringBuilder sb = new StringBuilder(TAG_LENGTH);
        for (int i = 0; i < TAG_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
