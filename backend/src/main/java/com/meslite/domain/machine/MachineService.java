package com.meslite.domain.machine;

import com.meslite.common.BusinessException;
import com.meslite.common.ResourceNotFoundException;
import com.meslite.domain.alert.AlertService;
import com.meslite.domain.department.DepartmentRepository;
import com.meslite.domain.machine.dto.MachineRequest;
import com.meslite.domain.machine.dto.MachineResponse;
import com.meslite.domain.machine.dto.MachineStatusLogResponse;
import com.meslite.domain.machine.dto.MachineStatusUpdateRequest;
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
public class MachineService {

    private final MachineRepository machineRepository;
    private final MachineStatusLogRepository machineStatusLogRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final MachineMapper machineMapper;
    private final AlertService alertService;

    public List<MachineResponse> getAll() {
        return machineRepository.findAllByIsActiveTrueOrderByIdAsc().stream()
                .map(machineMapper::toResponse)
                .toList();
    }

    public MachineResponse getById(Long id) {
        return machineMapper.toResponse(getMachine(id));
    }

    @Transactional
    public MachineResponse create(MachineRequest request) {
        Machine machine = new Machine();
        applyRequest(machine, request);
        machine.setStatusSince(OffsetDateTime.now());
        Machine saved = machineRepository.save(machine);
        createStatusLog(saved, null, saved.getStatus(), "Makine başlangıç kaydı oluşturuldu.");
        return machineMapper.toResponse(saved);
    }

    @Transactional
    public MachineResponse update(Long id, MachineRequest request) {
        Machine machine = getMachine(id);
        applyRequest(machine, request);
        return machineMapper.toResponse(machineRepository.save(machine));
    }

    @Transactional
    public void delete(Long id) {
        Machine machine = getMachine(id);
        machine.setIsActive(false);
        machineRepository.save(machine);
    }

    @Transactional
    public MachineResponse updateStatus(Long id, MachineStatusUpdateRequest request) {
        Machine machine = getMachine(id);
        MachineStatus oldStatus = machine.getStatus();
        if (oldStatus == request.getNewStatus()) {
            throw new BusinessException("Makine zaten seçilen durumda.", HttpStatus.BAD_REQUEST);
        }

        machineStatusLogRepository.findFirstByMachineIdAndEndedAtIsNullOrderByStartedAtDesc(id)
                .ifPresent(log -> {
                    log.setEndedAt(OffsetDateTime.now());
                    machineStatusLogRepository.save(log);
                });

        machine.setStatus(request.getNewStatus());
        machine.setStatusSince(OffsetDateTime.now());
        Machine saved = machineRepository.save(machine);
        createStatusLog(saved, oldStatus, request.getNewStatus(), request.getNote());
        alertService.evaluateMachineDurationAlert(saved);
        return machineMapper.toResponse(saved);
    }

    public List<MachineStatusLogResponse> getStatusLogs(Long machineId) {
        return machineStatusLogRepository.findAllByMachineIdOrderByStartedAtDesc(machineId).stream()
                .map(machineMapper::toLogResponse)
                .toList();
    }

    public List<Machine> getMachinesForCurrentScope() {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        return switch (currentUser.role()) {
            case ADMIN, FACTORY_MANAGER -> machineRepository.findAllByIsActiveTrueOrderByIdAsc();
            case SHIFT_SUPERVISOR -> machineRepository.findAllByDepartmentIdAndIsActiveTrueOrderByNameAsc(currentUser.departmentId());
            case OPERATOR -> machineRepository.findAllByIdInAndIsActiveTrueOrderByNameAsc(currentUser.machineIds());
        };
    }

    private void applyRequest(Machine machine, MachineRequest request) {
        machine.setDepartment(departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Bölüm bulunamadı.")));
        machine.setName(request.getName());
        machine.setSerialNumber(request.getSerialNumber());
        machine.setStatus(request.getStatus());
        machine.setIsActive(request.getIsActive());
    }

    private void createStatusLog(Machine machine, MachineStatus oldStatus, MachineStatus newStatus, String note) {
        User actor = userRepository.findByIdAndIsActiveTrue(SecurityUtils.currentUser().id())
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
        MachineStatusLog log = new MachineStatusLog();
        log.setMachine(machine);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setChangedBy(actor);
        log.setNote(note);
        log.setStartedAt(machine.getStatusSince());
        machineStatusLogRepository.save(log);
    }

    private Machine getMachine(Long id) {
        return machineRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Makine bulunamadı."));
    }
}

