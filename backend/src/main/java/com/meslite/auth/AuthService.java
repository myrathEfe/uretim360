package com.meslite.auth;

import com.meslite.auth.dto.LoginRequest;
import com.meslite.auth.dto.LoginResponse;
import com.meslite.domain.user.User;
import com.meslite.domain.user.UserMapper;
import com.meslite.domain.user.UserRepository;
import com.meslite.domain.user.dto.UserResponse;
import com.meslite.security.CustomUserPrincipal;
import com.meslite.security.JwtTokenProvider;
import com.meslite.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public LoginResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(principal);

        return LoginResponse.builder()
                .token(token)
                .userId(principal.id())
                .role(principal.role())
                .name(loadUser(principal.id()).getFullName())
                .email(principal.email())
                .build();
    }

    public LoginResponse refresh() {
        CustomUserPrincipal principal = SecurityUtils.currentUser();
        String token = jwtTokenProvider.generateToken(principal);
        User user = loadUser(principal.id());
        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(user.getRole())
                .name(user.getFullName())
                .email(user.getEmail())
                .build();
    }

    public UserResponse currentUser() {
        return userMapper.toResponse(loadUser(SecurityUtils.currentUser().id()));
    }

    private User loadUser(Long userId) {
        return userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Kullanıcı bulunamadı."));
    }
}

