package com.meslite.domain.user;

import com.meslite.common.BusinessException;
import com.meslite.common.ResourceNotFoundException;
import com.meslite.domain.department.Department;
import com.meslite.domain.department.DepartmentRepository;
import com.meslite.domain.machine.Machine;
import com.meslite.domain.machine.MachineMapper;
import com.meslite.domain.machine.MachineRepository;
import com.meslite.domain.machine.dto.MachineResponse;
import com.meslite.domain.user.dto.UserCreateRequest;
import com.meslite.domain.user.dto.UserResponse;
import com.meslite.domain.user.dto.UserUpdateRequest;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final MachineRepository machineRepository;
    private final UserMapper userMapper;
    private final MachineMapper machineMapper;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAll() {
        return userRepository.findAllByIsActiveTrueOrderByIdAsc().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    public UserResponse getById(Long id) {
        return userMapper.toResponse(getActiveUser(id));
    }

    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("Bu e-posta ile kayıtlı kullanıcı zaten var.", HttpStatus.CONFLICT);
        }

        User user = new User();
        applyCommonFields(user, request.getEmail(), request.getFullName(), request.getRole(), request.getDepartmentId(), request.getMachineIds());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(request.getIsActive() == null ? Boolean.TRUE : request.getIsActive());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getActiveUser(id);
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(request.getEmail(), id)) {
            throw new BusinessException("Bu e-posta başka bir kullanıcıda kayıtlı.", HttpStatus.CONFLICT);
        }

        applyCommonFields(user, request.getEmail(), request.getFullName(), request.getRole(), request.getDepartmentId(), request.getMachineIds());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        user.setIsActive(request.getIsActive());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void softDelete(Long id) {
        User user = getActiveUser(id);
        user.setIsActive(false);
        userRepository.save(user);
    }

    public List<MachineResponse> getAssignedMachines(Long id) {
        User user = getActiveUser(id);
        return user.getAssignedMachines().stream()
                .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
                .map(machineMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<MachineResponse> assignMachines(Long id, Set<Long> machineIds) {
        User user = getActiveUser(id);
        if (user.getRole() != Role.OPERATOR) {
            throw new BusinessException("Makine ataması yalnızca operatör kullanıcılar için yapılabilir.", HttpStatus.BAD_REQUEST);
        }
        user.setAssignedMachines(resolveMachines(machineIds));
        userRepository.save(user);
        return getAssignedMachines(id);
    }

    private void applyCommonFields(User user, String email, String fullName, Role role, Long departmentId, Set<Long> machineIds) {
        user.setEmail(email.toLowerCase());
        user.setFullName(fullName);
        user.setRole(role);

        if (role == Role.SHIFT_SUPERVISOR) {
            if (departmentId == null) {
                throw new BusinessException("Vardiya şefi için bölüm atanması zorunludur.", HttpStatus.BAD_REQUEST);
            }
            user.setDepartment(resolveDepartment(departmentId));
            user.setAssignedMachines(new LinkedHashSet<>());
        } else if (role == Role.OPERATOR) {
            user.setDepartment(null);
            user.setAssignedMachines(resolveMachines(machineIds));
        } else {
            user.setDepartment(null);
            user.setAssignedMachines(new LinkedHashSet<>());
        }
    }

    private Department resolveDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bölüm bulunamadı."));
    }

    private Set<Machine> resolveMachines(Set<Long> machineIds) {
        if (machineIds == null || machineIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        List<Machine> machines = machineRepository.findAllByIdInAndIsActiveTrueOrderByNameAsc(machineIds);
        if (machines.size() != machineIds.size()) {
            throw new ResourceNotFoundException("Atanmak istenen makinelerden biri bulunamadı.");
        }
        return new LinkedHashSet<>(machines);
    }

    private User getActiveUser(Long id) {
        return userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
    }
}

