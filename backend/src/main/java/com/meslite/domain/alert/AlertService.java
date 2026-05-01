package com.meslite.domain.alert;

import com.meslite.common.BusinessException;
import com.meslite.common.ResourceNotFoundException;
import com.meslite.domain.machine.Machine;
import com.meslite.domain.machine.MachineRepository;
import com.meslite.domain.machine.MachineStatus;
import com.meslite.domain.material.Material;
import com.meslite.domain.production.ProductionRecord;
import com.meslite.domain.shift.ShiftRepository;
import com.meslite.domain.user.Role;
import com.meslite.security.CustomUserPrincipal;
import com.meslite.security.SecurityUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final AlertMapper alertMapper;
    private final MachineRepository machineRepository;
    private final ShiftRepository shiftRepository;

    public List<com.meslite.domain.alert.dto.AlertResponse> getAlerts() {
        evaluateDurationAlerts();
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        return alertRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(alert -> switch (currentUser.role()) {
                    case ADMIN, FACTORY_MANAGER -> true;
                    case SHIFT_SUPERVISOR -> alert.getMachine() != null
                            && alert.getMachine().getDepartment() != null
                            && currentUser.departmentId() != null
                            && currentUser.departmentId().equals(alert.getMachine().getDepartment().getId());
                    case OPERATOR -> false;
                })
                .map(alertMapper::toResponse)
                .toList();
    }

    @Transactional
    public com.meslite.domain.alert.dto.AlertResponse markRead(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Uyarı bulunamadı."));
        validateScope(alert);
        alert.setIsRead(true);
        return alertMapper.toResponse(alertRepository.save(alert));
    }

    public long getUnreadCount() {
        evaluateDurationAlerts();
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        return alertRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(alert -> !Boolean.TRUE.equals(alert.getIsRead()))
                .filter(alert -> switch (currentUser.role()) {
                    case ADMIN, FACTORY_MANAGER -> true;
                    case SHIFT_SUPERVISOR -> alert.getMachine() != null
                            && alert.getMachine().getDepartment() != null
                            && currentUser.departmentId() != null
                            && currentUser.departmentId().equals(alert.getMachine().getDepartment().getId());
                    case OPERATOR -> alert.getMachine() != null && currentUser.machineIds().contains(alert.getMachine().getId());
                })
                .count();
    }

    @Transactional
    public void evaluateWasteAlert(ProductionRecord record) {
        BigDecimal wasteRate = record.getWasteRate();
        if (wasteRate == null || wasteRate.compareTo(BigDecimal.valueOf(10)) <= 0) {
            return;
        }

        Alert alert = new Alert();
        alert.setAlertType(AlertType.HIGH_WASTE_RATE);
        alert.setSeverity(wasteRate.compareTo(BigDecimal.valueOf(20)) > 0 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING);
        alert.setMachine(record.getMachine());
        alert.setMaterial(record.getMaterial());
        alert.setThresholdValue(wasteRate.compareTo(BigDecimal.valueOf(20)) > 0 ? BigDecimal.valueOf(20) : BigDecimal.valueOf(10));
        alert.setActualValue(wasteRate.setScale(3, RoundingMode.HALF_UP));
        alert.setMessage("%s için fire oranı eşik değeri aştı.".formatted(record.getMachine().getName()));
        alertRepository.save(alert);
    }

    @Transactional
    public void evaluateMachineDurationAlert(Machine machine) {
        if (machine.getStatus() == MachineStatus.FAULT) {
            long minutes = Duration.between(machine.getStatusSince(), OffsetDateTime.now()).toMinutes();
            if (minutes > 10 && !alertRepository.existsByAlertTypeAndMachineIdAndIsReadFalse(AlertType.LONG_FAULT_DURATION, machine.getId())) {
                createDurationAlert(machine, AlertType.LONG_FAULT_DURATION, AlertSeverity.CRITICAL, 10, minutes,
                        "%s 10 dakikadan uzun süredir arıza durumunda.".formatted(machine.getName()));
            }
        }

        if (machine.getStatus() == MachineStatus.STOPPED
                && shiftRepository.existsByIsActiveTrueAndStartTimeBeforeAndEndTimeIsNull(OffsetDateTime.now())) {
            long minutes = Duration.between(machine.getStatusSince(), OffsetDateTime.now()).toMinutes();
            if (minutes > 30 && !alertRepository.existsByAlertTypeAndMachineIdAndIsReadFalse(AlertType.LONG_STOP_DURATION, machine.getId())) {
                createDurationAlert(machine, AlertType.LONG_STOP_DURATION, AlertSeverity.WARNING, 30, minutes,
                        "%s aktif vardiyada 30 dakikadan uzun süredir duruyor.".formatted(machine.getName()));
            }
        }
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void evaluateDurationAlerts() {
        machineRepository.findAllByIsActiveTrueOrderByIdAsc().forEach(this::evaluateMachineDurationAlert);
    }

    private void createDurationAlert(Machine machine, AlertType alertType, AlertSeverity severity, long threshold, long actual, String message) {
        Alert alert = new Alert();
        alert.setAlertType(alertType);
        alert.setSeverity(severity);
        alert.setMachine(machine);
        alert.setMessage(message);
        alert.setThresholdValue(BigDecimal.valueOf(threshold));
        alert.setActualValue(BigDecimal.valueOf(actual));
        alertRepository.save(alert);
    }

    private void validateScope(Alert alert) {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        if (currentUser.role() == Role.ADMIN || currentUser.role() == Role.FACTORY_MANAGER) {
            return;
        }
        if (currentUser.role() == Role.SHIFT_SUPERVISOR) {
            if (alert.getMachine() == null || alert.getMachine().getDepartment() == null
                    || !currentUser.departmentId().equals(alert.getMachine().getDepartment().getId())) {
                throw new BusinessException("Bu uyarı üzerinde işlem yetkiniz yok.", HttpStatus.FORBIDDEN);
            }
            return;
        }
        if (alert.getMachine() == null || !currentUser.machineIds().contains(alert.getMachine().getId())) {
            throw new BusinessException("Bu uyarı üzerinde işlem yetkiniz yok.", HttpStatus.FORBIDDEN);
        }
    }
}

