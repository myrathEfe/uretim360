package com.meslite.security;

import com.meslite.domain.alert.AlertRepository;
import com.meslite.domain.machine.MachineRepository;
import com.meslite.domain.material.MaterialRepository;
import com.meslite.domain.production.ProductionRecordRepository;
import com.meslite.domain.shift.ShiftRepository;
import com.meslite.domain.user.Role;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("accessControlService")
@RequiredArgsConstructor
public class AccessControlService {

    private final MachineRepository machineRepository;
    private final MaterialRepository materialRepository;
    private final ProductionRecordRepository productionRecordRepository;
    private final ShiftRepository shiftRepository;
    private final AlertRepository alertRepository;

    public boolean canAccessMachine(Authentication authentication, Long machineId) {
        return machineRepository.findByIdAndIsActiveTrue(machineId)
                .map(machine -> hasMachineAccess(authentication, machine.getDepartment().getId(), machine.getId()))
                .orElse(false);
    }

    public boolean canAccessDepartment(Authentication authentication, Long departmentId) {
        if (!(authentication.getPrincipal() instanceof CustomUserPrincipal principal)) {
            return false;
        }
        if (principal.role() == Role.ADMIN || principal.role() == Role.FACTORY_MANAGER) {
            return true;
        }
        if (principal.role() == Role.SHIFT_SUPERVISOR) {
            return Objects.equals(principal.departmentId(), departmentId);
        }
        return principal.machineIds().stream()
                .anyMatch(machineId -> machineRepository.findByIdAndIsActiveTrue(machineId)
                        .map(machine -> Objects.equals(machine.getDepartment().getId(), departmentId))
                        .orElse(false));
    }

    public boolean canAccessMaterial(Authentication authentication, Long materialId) {
        return materialRepository.findById(materialId)
                .map(material -> {
                    Long departmentId = material.getCurrentDepartment() != null ? material.getCurrentDepartment().getId() : null;
                    Long machineId = material.getCurrentMachine() != null ? material.getCurrentMachine().getId() : null;
                    return hasMachineAccess(authentication, departmentId, machineId);
                })
                .orElse(false);
    }

    public boolean canAccessProductionRecord(Authentication authentication, Long recordId) {
        return productionRecordRepository.findById(recordId)
                .map(record -> hasMachineAccess(authentication, record.getDepartment().getId(), record.getMachine().getId()))
                .orElse(false);
    }

    public boolean canAccessShift(Authentication authentication, Long shiftId) {
        if (!(authentication.getPrincipal() instanceof CustomUserPrincipal principal)) {
            return false;
        }
        if (principal.role() == Role.ADMIN || principal.role() == Role.FACTORY_MANAGER || principal.role() == Role.OPERATOR) {
            return true;
        }
        return shiftRepository.findById(shiftId)
                .map(shift -> shift.getSupervisor() != null && Objects.equals(shift.getSupervisor().getId(), principal.id()))
                .orElse(false);
    }

    public boolean canAccessAlert(Authentication authentication, Long alertId) {
        return alertRepository.findById(alertId)
                .map(alert -> {
                    Long departmentId = alert.getMachine() != null && alert.getMachine().getDepartment() != null
                            ? alert.getMachine().getDepartment().getId()
                            : (alert.getMaterial() != null && alert.getMaterial().getCurrentDepartment() != null
                            ? alert.getMaterial().getCurrentDepartment().getId() : null);
                    Long machineId = alert.getMachine() != null ? alert.getMachine().getId() : null;
                    return hasMachineAccess(authentication, departmentId, machineId);
                })
                .orElse(false);
    }

    private boolean hasMachineAccess(Authentication authentication, Long departmentId, Long machineId) {
        if (!(authentication.getPrincipal() instanceof CustomUserPrincipal principal)) {
            return false;
        }

        if (principal.role() == Role.ADMIN || principal.role() == Role.FACTORY_MANAGER) {
            return true;
        }
        if (principal.role() == Role.SHIFT_SUPERVISOR) {
            return Objects.equals(principal.departmentId(), departmentId);
        }
        return machineId != null && principal.machineIds().contains(machineId);
    }
}

