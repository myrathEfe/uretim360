package com.meslite.domain.material;

import com.meslite.common.BusinessException;
import com.meslite.common.ResourceNotFoundException;
import com.meslite.domain.department.Department;
import com.meslite.domain.department.DepartmentRepository;
import com.meslite.domain.department.SectorType;
import com.meslite.domain.machine.Machine;
import com.meslite.domain.machine.MachineRepository;
import com.meslite.domain.material.dto.MaterialCreateRequest;
import com.meslite.domain.material.dto.MaterialHistoryResponse;
import com.meslite.domain.material.dto.MaterialResponse;
import com.meslite.domain.material.dto.MaterialUpdateRequest;
import com.meslite.domain.user.Role;
import com.meslite.security.CustomUserPrincipal;
import com.meslite.security.SecurityUtils;
import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialStageHistoryRepository materialStageHistoryRepository;
    private final TrackingCodeSequenceRepository trackingCodeSequenceRepository;
    private final DepartmentRepository departmentRepository;
    private final MachineRepository machineRepository;
    private final MaterialMapper materialMapper;

    public List<MaterialResponse> getAll() {
        return materialRepository.findAllByOrderByIdAsc().stream()
                .map(materialMapper::toResponse)
                .toList();
    }

    public MaterialResponse getById(Long id) {
        return materialMapper.toResponse(getMaterial(id));
    }

    public MaterialResponse getByTrackingCode(String trackingCode) {
        Material material = materialRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Takip koduna ait malzeme bulunamadı."));
        validateMaterialScope(material);
        return materialMapper.toResponse(material);
    }

    @Transactional
    public MaterialResponse create(MaterialCreateRequest request) {
        Department department = resolveDepartment(request.getCurrentDepartmentId());
        enforceSupervisorDepartment(department.getId());

        Material material = new Material();
        material.setTrackingCode(generateTrackingCode(department.getSectorType()));
        material.setName(request.getName());
        material.setMaterialType(request.getMaterialType());
        material.setCurrentDepartment(department);
        material.setCurrentMachine(resolveMachine(request.getCurrentMachineId(), department.getId()));
        material.setTotalInputQty(BigDecimal.ZERO);
        material.setTotalOutputQty(BigDecimal.ZERO);
        material.setIsCompleted(false);

        Material saved = materialRepository.save(material);
        createStageHistory(saved, saved.getCurrentMachine(), department, null);
        return materialMapper.toResponse(saved);
    }

    @Transactional
    public MaterialResponse update(Long id, MaterialUpdateRequest request) {
        Material material = getMaterial(id);
        enforceSupervisorDepartment(material.getCurrentDepartment() != null ? material.getCurrentDepartment().getId() : null);

        Department department = resolveDepartment(request.getCurrentDepartmentId());
        Machine machine = resolveMachine(request.getCurrentMachineId(), department.getId());

        material.setName(request.getName());
        material.setCurrentDepartment(department);
        material.setCurrentMachine(machine);
        material.setIsCompleted(request.getIsCompleted());
        Material saved = materialRepository.save(material);
        return materialMapper.toResponse(saved);
    }

    public List<MaterialHistoryResponse> getHistory(Long id) {
        Material material = getMaterial(id);
        validateMaterialScope(material);
        return materialStageHistoryRepository.findAllByMaterialIdOrderByEnteredAtAsc(id).stream()
                .map(materialMapper::toHistoryResponse)
                .toList();
    }

    @Transactional
    public void updateMaterialPositionFromProduction(Material material, Machine machine, com.meslite.domain.production.ProductionRecord record) {
        material.setCurrentMachine(machine);
        material.setCurrentDepartment(machine.getDepartment());
        material.setTotalInputQty(material.getTotalInputQty().add(record.getInputQty()));
        material.setTotalOutputQty(material.getTotalOutputQty().add(record.getOutputQty()));
        materialRepository.save(material);

        materialStageHistoryRepository.findFirstByMaterialIdAndLeftAtIsNullOrderByEnteredAtDesc(material.getId())
                .ifPresent(history -> {
                    history.setLeftAt(record.getRecordedAt());
                    materialStageHistoryRepository.save(history);
                });

        createStageHistory(material, machine, machine.getDepartment(), record);
    }

    @Transactional
    public void recalculateAfterProductionDelete(Material material) {
        List<com.meslite.domain.production.ProductionRecord> records = new java.util.ArrayList<>();
        material.setTotalInputQty(records.stream()
                .map(com.meslite.domain.production.ProductionRecord::getInputQty)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        material.setTotalOutputQty(records.stream()
                .map(com.meslite.domain.production.ProductionRecord::getOutputQty)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        materialRepository.save(material);
    }

    @Transactional
    public String generateTrackingCode(SectorType sectorType) {
        String sectorPrefix = switch (sectorType) {
            case TEXTILE -> "TXT";
            case FOOD -> "FOD";
            case METAL -> "MTL";
            case PLASTIC -> "PLS";
        };
        int year = Year.now().getValue();
        TrackingCodeSequence sequence = trackingCodeSequenceRepository.findBySectorPrefixAndYear(sectorPrefix, year)
                .orElseGet(() -> {
                    TrackingCodeSequence newSequence = new TrackingCodeSequence();
                    newSequence.setSectorPrefix(sectorPrefix);
                    newSequence.setYear(year);
                    newSequence.setLastSeq(0);
                    return trackingCodeSequenceRepository.save(newSequence);
                });
        sequence.setLastSeq(sequence.getLastSeq() + 1);
        trackingCodeSequenceRepository.save(sequence);
        return "%s-%d-%05d".formatted(sectorPrefix, year, sequence.getLastSeq());
    }

    public Material getMaterial(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Malzeme bulunamadı."));
        validateMaterialScope(material);
        return material;
    }

    private void createStageHistory(Material material, Machine machine, Department department, com.meslite.domain.production.ProductionRecord record) {
        MaterialStageHistory history = new MaterialStageHistory();
        history.setMaterial(material);
        history.setMachine(machine);
        history.setDepartment(department);
        history.setProductionRecord(record);
        history.setEnteredAt(record != null ? record.getRecordedAt() : java.time.OffsetDateTime.now());
        materialStageHistoryRepository.save(history);
    }

    private Department resolveDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bölüm bulunamadı."));
    }

    private Machine resolveMachine(Long machineId, Long departmentId) {
        if (machineId == null) {
            return null;
        }
        Machine machine = machineRepository.findByIdAndIsActiveTrue(machineId)
                .orElseThrow(() -> new ResourceNotFoundException("Makine bulunamadı."));
        if (!machine.getDepartment().getId().equals(departmentId)) {
            throw new BusinessException("Makine seçilen bölüme ait değil.", HttpStatus.BAD_REQUEST);
        }
        return machine;
    }

    private void enforceSupervisorDepartment(Long departmentId) {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        if (currentUser.role() == Role.SHIFT_SUPERVISOR && !currentUser.departmentId().equals(departmentId)) {
            throw new BusinessException("Yalnızca kendi bölümünüze ait malzemeleri yönetebilirsiniz.", HttpStatus.FORBIDDEN);
        }
    }

    private void validateMaterialScope(Material material) {
        CustomUserPrincipal currentUser = SecurityUtils.currentUser();
        if (currentUser.role() == Role.ADMIN || currentUser.role() == Role.FACTORY_MANAGER) {
            return;
        }
        if (currentUser.role() == Role.SHIFT_SUPERVISOR) {
            if (material.getCurrentDepartment() == null || !currentUser.departmentId().equals(material.getCurrentDepartment().getId())) {
                throw new BusinessException("Bu malzemeye erişim yetkiniz yok.", HttpStatus.FORBIDDEN);
            }
            return;
        }
        if (material.getCurrentMachine() == null || !currentUser.machineIds().contains(material.getCurrentMachine().getId())) {
            throw new BusinessException("Bu malzemeye erişim yetkiniz yok.", HttpStatus.FORBIDDEN);
        }
    }
}

