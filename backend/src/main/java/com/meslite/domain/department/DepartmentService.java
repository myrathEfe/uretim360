package com.meslite.domain.department;

import com.meslite.common.ResourceNotFoundException;
import com.meslite.domain.machine.MachineMapper;
import com.meslite.domain.machine.MachineRepository;
import com.meslite.domain.machine.dto.MachineResponse;
import com.meslite.domain.department.dto.DepartmentRequest;
import com.meslite.domain.department.dto.DepartmentResponse;
import com.meslite.security.CustomUserPrincipal;
import com.meslite.security.SecurityUtils;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final MachineRepository machineRepository;
    private final MachineMapper machineMapper;

    public List<DepartmentResponse> getAll() {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        return departmentRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .filter(department -> currentUser.role() != com.meslite.domain.user.Role.SHIFT_SUPERVISOR
                        || (currentUser.departmentId() != null && currentUser.departmentId().equals(department.getId())))
                .map(departmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        Department department = new Department();
        applyRequest(department, request);
        return departmentMapper.toResponse(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = getByIdEntity(id);
        applyRequest(department, request);
        return departmentMapper.toResponse(departmentRepository.save(department));
    }

    @Transactional
    public void delete(Long id) {
        Department department = getByIdEntity(id);
        department.setIsActive(false);
        departmentRepository.save(department);
    }

    public List<MachineResponse> getDepartmentMachines(Long departmentId) {
        return machineRepository.findAllByDepartmentIdAndIsActiveTrueOrderByNameAsc(departmentId).stream()
                .filter(machine -> switch (SecurityUtils.currentUser().role()) {
                    case ADMIN, FACTORY_MANAGER -> true;
                    case SHIFT_SUPERVISOR -> SecurityUtils.currentUser().departmentId() != null
                            && SecurityUtils.currentUser().departmentId().equals(machine.getDepartment().getId());
                    case OPERATOR -> SecurityUtils.currentUser().machineIds().contains(machine.getId());
                })
                .map(machineMapper::toResponse)
                .toList();
    }

    private void applyRequest(Department department, DepartmentRequest request) {
        department.setName(request.getName());
        department.setSectorType(request.getSectorType());
        department.setDisplayOrder(request.getDisplayOrder());
        department.setIsActive(request.getIsActive());
    }

    private Department getByIdEntity(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bölüm bulunamadı."));
    }
}

