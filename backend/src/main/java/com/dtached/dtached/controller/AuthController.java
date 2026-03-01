package com.dtached.dtached.controller;

import com.dtached.dtached.dto.AuthResponse;
import com.dtached.dtached.dto.LoginRequest;
import com.dtached.dtached.dto.RegisterRequest;
import com.dtached.dtached.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }

    @GetMapping("/confirm")
    public ResponseEntity<AuthResponse> confirmEmail(@RequestParam String token) {
        return ResponseEntity.ok(authService.confirmEmail(token));
    }

    @PostMapping("/select-role")
    public ResponseEntity<AuthResponse> selectRole(
            Authentication authentication,
            @RequestBody Map<String, String> body
    ) {
        String role = body.get("role");
        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        return ResponseEntity.ok(authService.selectRole(authentication.getName(), role));
    }

    @PostMapping("/resend-confirmation")
    public ResponseEntity<AuthResponse> resendConfirmation(Authentication authentication) {
        return ResponseEntity.ok(authService.resendConfirmation(authentication.getName()));
    }
}
