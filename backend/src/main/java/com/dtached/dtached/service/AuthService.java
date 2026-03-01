package com.dtached.dtached.service;

import com.dtached.dtached.dto.AuthResponse;
import com.dtached.dtached.dto.LoginRequest;
import com.dtached.dtached.dto.RegisterRequest;
import com.dtached.dtached.model.User;
import com.dtached.dtached.model.enums.UserRole;
import com.dtached.dtached.repository.UserRepository;
import com.dtached.dtached.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Generate confirmation token
        String confirmToken = UUID.randomUUID().toString().replace("-", "");

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(null)  // Role selected post-login
                .emailConfirmed(false)
                .confirmationToken(confirmToken)
                .confirmationExpiresAt(LocalDateTime.now().plusHours(24))
                .build();

        user = userRepository.save(user);

        // Log confirmation link (replace with real email service later)
        log.info("📧 EMAIL CONFIRMATION for {}: /api/auth/confirm?token={}", email, confirmToken);

        String token = jwtService.generateToken(user.getEmail(), "UNCONFIRMED");

        return buildResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadCredentialsException("Account is deactivated");
        }

        String roleName = user.getRole() != null ? user.getRole().name() : "UNCONFIRMED";
        String token = jwtService.generateToken(user.getEmail(), roleName);

        return buildResponse(user, token);
    }

    @Transactional
    public AuthResponse confirmEmail(String confirmToken) {
        User user = userRepository.findByConfirmationToken(confirmToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid confirmation token"));

        if (user.getConfirmationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Confirmation token has expired");
        }

        user.setEmailConfirmed(true);
        user.setConfirmationToken(null);
        user.setConfirmationExpiresAt(null);
        userRepository.save(user);

        String roleName = user.getRole() != null ? user.getRole().name() : "UNCONFIRMED";
        String token = jwtService.generateToken(user.getEmail(), roleName);

        return buildResponse(user, token);
    }

    @Transactional
    public AuthResponse selectRole(String email, String roleStr) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != null) {
            throw new IllegalArgumentException("Role already selected");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + roleStr);
        }

        if (role == UserRole.ADMIN || role == UserRole.STAFF) {
            throw new IllegalArgumentException("Cannot self-select " + role);
        }

        user.setRole(role);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), role.name());

        return buildResponse(user, token);
    }

    @Transactional
    public AuthResponse resendConfirmation(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailConfirmed())) {
            throw new IllegalArgumentException("Email already confirmed");
        }

        String confirmToken = UUID.randomUUID().toString().replace("-", "");
        user.setConfirmationToken(confirmToken);
        user.setConfirmationExpiresAt(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        log.info("📧 RESEND EMAIL CONFIRMATION for {}: /api/auth/confirm?token={}", email, confirmToken);

        return buildResponse(user, null);
    }

    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildResponse(user, null);
    }

    /**
     * Request a password reset — generates a token and logs the link.
     */
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT).trim())
                .orElseThrow(() -> new IllegalArgumentException("No account found with that email"));

        String resetToken = UUID.randomUUID().toString().replace("-", "");
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Log reset link (replace with SendGrid later)
        log.info("🔑 PASSWORD RESET for {}: /reset-password?token={}", email, resetToken);
    }

    /**
     * Reset password using a valid token.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .userId(user.getId())
                .emailConfirmed(Boolean.TRUE.equals(user.getEmailConfirmed()))
                .needsRole(user.getRole() == null)
                .build();
    }
}
