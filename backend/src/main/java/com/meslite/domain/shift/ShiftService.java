package com.meslite.domain.shift;

import com.meslite.common.BusinessException;
import com.meslite.common.ResourceNotFoundException;
import com.meslite.domain.shift.dto.ShiftCreateRequest;
import com.meslite.domain.shift.dto.ShiftResponse;
import com.meslite.domain.shift.dto.ShiftUpdateRequest;
import com.meslite.domain.user.Role;
import com.meslite.domain.user.User;
import com.meslite.domain.user.UserRepository;
import com.meslite.security.CustomUserPrincipal;
import com.meslite.security.SecurityUtils;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final ShiftMapper shiftMapper;

    public List<ShiftResponse> getAll() {
        return shiftRepository.findAllByOrderByStartTimeDesc().stream()
                .map(shiftMapper::toResponse)
                .toList();
    }

    @Transactional
    public ShiftResponse create(ShiftCreateRequest request) {
        Shift shift = new Shift();
        shift.setName(request.getName());
        shift.setSupervisor(resolveSupervisorForCreate(request.getSupervisorId()));
        shift.setStartTime(request.getStartTime());
        shift.setIsActive(true);
        return shiftMapper.toResponse(shiftRepository.save(shift));
    }

    @Transactional
    public ShiftResponse update(Long id, ShiftUpdateRequest request) {
        Shift shift = getShift(id);
        validateOwnership(shift);
        shift.setName(request.getName());
        shift.setSupervisor(resolveSupervisorForUpdate(request.getSupervisorId(), shift.getSupervisor()));
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setIsActive(request.getIsActive() && request.getEndTime() == null);
        return shiftMapper.toResponse(shiftRepository.save(shift));
    }

    @Transactional
    public ShiftResponse endShift(Long id) {
        Shift shift = getShift(id);
        validateOwnership(shift);
        shift.setEndTime(OffsetDateTime.now());
        shift.setIsActive(false);
        return shiftMapper.toResponse(shiftRepository.save(shift));
    }

    private Shift getShift(Long id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vardiya bulunamadı."));
    }

    private User resolveSupervisorForCreate(Long supervisorId) {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        if (currentUser.role() == Role.SHIFT_SUPERVISOR) {
            return getUser(currentUser.id());
        }
        if (supervisorId == null) {
            throw new BusinessException("Vardiya oluşturulurken bir şef seçilmelidir.", HttpStatus.BAD_REQUEST);
        }
        return getUser(supervisorId);
    }

    private User resolveSupervisorForUpdate(Long supervisorId, User existingSupervisor) {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        if (currentUser.role() == Role.SHIFT_SUPERVISOR) {
            return getUser(currentUser.id());
        }
        if (supervisorId == null) {
            return existingSupervisor;
        }
        return getUser(supervisorId);
    }

    private User getUser(Long userId) {
        return userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
    }

    private void validateOwnership(Shift shift) {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        if (currentUser.role() == Role.ADMIN) {
            return;
        }
        if (shift.getSupervisor() == null || !shift.getSupervisor().getId().equals(currentUser.id())) {
            throw new BusinessException("Bu vardiya üzerinde işlem yetkiniz yok.", HttpStatus.FORBIDDEN);
        }
    }
}

