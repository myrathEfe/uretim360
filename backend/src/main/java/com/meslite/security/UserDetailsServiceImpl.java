package com.meslite.security;

import com.meslite.common.ResourceNotFoundException;
import com.meslite.domain.user.User;
import com.meslite.domain.user.UserRepository;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailAndIsActiveTrue(username)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı."));

        return new CustomUserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getAssignedMachines().stream().map(machine -> machine.getId()).collect(Collectors.toSet()),
                Boolean.TRUE.equals(user.getIsActive())
        );
    }
}

