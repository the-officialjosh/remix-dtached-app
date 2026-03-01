package com.dtached.dtached.security;

import com.dtached.dtached.model.User;
import com.dtached.dtached.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // Build authorities — handle null role (user hasn't selected yet)
        List<SimpleGrantedAuthority> authorities;
        if (user.getRole() != null) {
            authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        } else {
            authorities = Collections.emptyList();
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Boolean.TRUE.equals(user.getIsActive()),
                true, true, true,
                authorities
        );
    }
}
