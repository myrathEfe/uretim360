package com.meslite.domain.production;

import com.meslite.common.BusinessException;
import com.meslite.common.ResourceNotFoundException;
import com.meslite.domain.alert.AlertService;
import com.meslite.domain.machine.Machine;
import com.meslite.domain.machine.MachineRepository;
import com.meslite.domain.material.Material;
import com.meslite.domain.material.MaterialService;
import com.meslite.domain.material.MaterialStageHistoryRepository;
import com.meslite.domain.production.dto.ProductionRecordCreateRequest;
import com.meslite.domain.production.dto.ProductionRecordResponse;
import com.meslite.domain.shift.Shift;
import com.meslite.domain.shift.ShiftRepository;
import com.meslite.domain.user.Role;
import com.meslite.domain.user.User;
import com.meslite.domain.user.UserRepository;
import com.meslite.security.CustomUserPrincipal;
import com.meslite.security.SecurityUtils;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductionRecordService {

    private final ProductionRecordRepository productionRecordRepository;
    private final MachineRepository machineRepository;
    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final MaterialService materialService;
    private final MaterialStageHistoryRepository materialStageHistoryRepository;
    private final ProductionMapper productionMapper;
    private final AlertService alertService;

    public List<ProductionRecordResponse> getAllScoped() {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        List<ProductionRecord> records = switch (currentUser.role()) {
            case ADMIN, FACTORY_MANAGER -> productionRecordRepository.findAllByOrderByRecordedAtDesc();
            case SHIFT_SUPERVISOR -> productionRecordRepository.findAllByDepartmentIdOrderByRecordedAtDesc(currentUser.departmentId());
            case OPERATOR -> productionRecordRepository.findAllByMachineIdInOrderByRecordedAtDesc(currentUser.machineIds());
        };
        return records.stream().map(productionMapper::toResponse).toList();
    }

    public ProductionRecordResponse getById(Long id) {
        return productionMapper.toResponse(getRecord(id));
    }

    @Transactional
    public ProductionRecordResponse create(ProductionRecordCreateRequest request) {
        ProductionRecord record = new ProductionRecord();
        applyRequest(record, request, true);
        ProductionRecord saved = productionRecordRepository.save(record);
        materialService.rebuildMaterialState(saved.getMaterial().getId());
        alertService.evaluateWasteAlert(saved);
        return productionMapper.toResponse(saved);
    }

    @Transactional
    public ProductionRecordResponse update(Long id, ProductionRecordCreateRequest request) {
        ProductionRecord record = getRecord(id);
        Long previousMaterialId = record.getMaterial().getId();
        applyRequest(record, request, false);
        ProductionRecord saved = productionRecordRepository.save(record);
        materialService.rebuildMaterialState(previousMaterialId);
        if (!previousMaterialId.equals(saved.getMaterial().getId())) {
            materialService.rebuildMaterialState(saved.getMaterial().getId());
        }
        return productionMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        ProductionRecord record = getRecord(id);
        Material material = record.getMaterial();
        materialStageHistoryRepository.findAllByProductionRecordId(id).forEach(materialStageHistoryRepository::delete);
        productionRecordRepository.delete(record);
        materialService.rebuildMaterialState(material.getId());
    }

    private void applyRequest(ProductionRecord record, ProductionRecordCreateRequest request, boolean isCreate) {
        if (request.getOutputQty().compareTo(request.getInputQty()) > 0) {
            throw new BusinessException("Çıktı miktarı girdi miktarından büyük olamaz.", HttpStatus.BAD_REQUEST);
        }

        Machine machine = machineRepository.findByIdAndIsActiveTrue(request.getMachineId())
                .orElseThrow(() -> new ResourceNotFoundException("Makine bulunamadı."));
        validateMachineScope(machine);

        Material material = materialService.getMaterial(request.getMaterialId());
        Shift shift = resolveShift(request.getShiftId());
        record.setMaterial(material);
        record.setMachine(machine);
        record.setDepartment(machine.getDepartment());
        record.setShift(shift);
        if (isCreate) {
            User actor = userRepository.findByIdAndIsActiveTrue(SecurityUtils.currentUser().id())
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
            record.setRecordedBy(actor);
        }
        record.setInputQty(request.getInputQty());
        record.setOutputQty(request.getOutputQty());
        record.setNotes(request.getNotes());
    }

    private Shift resolveShift(Long shiftId) {
        if (shiftId == null) {
            return null;
        }
        return shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Vardiya bulunamadı."));
    }

    private ProductionRecord getRecord(Long id) {
        ProductionRecord record = productionRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Üretim kaydı bulunamadı."));
        validateMachineScope(record.getMachine());
        return record;
    }

    private void validateMachineScope(Machine machine) {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        if (currentUser.role() == Role.ADMIN || currentUser.role() == Role.FACTORY_MANAGER) {
            return;
        }
        if (currentUser.role() == Role.SHIFT_SUPERVISOR) {
            if (!currentUser.departmentId().equals(machine.getDepartment().getId())) {
                throw new BusinessException("Bu makine üzerinde işlem yetkiniz yok.", HttpStatus.FORBIDDEN);
            }
            return;
        }
        if (!currentUser.machineIds().contains(machine.getId())) {
            throw new BusinessException("Bu makine üzerinde işlem yetkiniz yok.", HttpStatus.FORBIDDEN);
        }
    }

}
