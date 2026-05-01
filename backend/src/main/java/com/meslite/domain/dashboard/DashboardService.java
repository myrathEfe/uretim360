package com.meslite.domain.dashboard;

import com.meslite.domain.dashboard.dto.DashboardSummaryResponse;
import com.meslite.domain.dashboard.dto.DepartmentStatItem;
import com.meslite.domain.dashboard.dto.MachineStatusDistributionItem;
import com.meslite.domain.dashboard.dto.MachineStatusGridItem;
import com.meslite.domain.dashboard.dto.ProductionTrendItem;
import com.meslite.domain.dashboard.dto.SummaryCardResponse;
import com.meslite.domain.dashboard.dto.WasteMachineItem;
import com.meslite.domain.machine.Machine;
import com.meslite.domain.machine.MachineService;
import com.meslite.domain.production.ProductionRecord;
import com.meslite.domain.production.ProductionRecordRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductionRecordRepository productionRecordRepository;
    private final MachineService machineService;

    public DashboardSummaryResponse getSummary() {
        OffsetDateTime start = LocalDate.now(ZoneOffset.UTC).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.now(ZoneOffset.UTC);
        List<ProductionRecord> todayRecords = productionRecordRepository.findAllByRecordedAtBetweenOrderByRecordedAtAsc(start, end);
        List<Machine> machines = machineService.getMachinesForCurrentScope();

        BigDecimal totalProduction = todayRecords.stream()
                .map(ProductionRecord::getOutputQty)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalWaste = todayRecords.stream()
                .map(record -> safeSubtract(record.getInputQty(), record.getOutputQty()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageWasteRate = todayRecords.isEmpty()
                ? BigDecimal.ZERO
                : todayRecords.stream()
                .map(ProductionRecord::getWasteRate)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(todayRecords.size()), 3, RoundingMode.HALF_UP);

        Map<com.meslite.domain.machine.MachineStatus, Long> statusCounts = new EnumMap<>(com.meslite.domain.machine.MachineStatus.class);
        machines.forEach(machine -> statusCounts.merge(machine.getStatus(), 1L, Long::sum));

        return DashboardSummaryResponse.builder()
                .summary(SummaryCardResponse.builder()
                        .totalProduction(totalProduction)
                        .totalWaste(totalWaste)
                        .averageWasteRate(averageWasteRate)
                        .faultyMachineCount(statusCounts.getOrDefault(com.meslite.domain.machine.MachineStatus.FAULT, 0L))
                        .build())
                .machineStatusCounts(statusCounts.entrySet().stream()
                        .map(entry -> MachineStatusDistributionItem.builder()
                                .status(entry.getKey())
                                .count(entry.getValue())
                                .build())
                        .toList())
                .topWasteMachines(getTopWasteMachines())
                .departmentBreakdown(getDepartmentStats())
                .build();
    }

    public List<MachineStatusGridItem> getMachineStatusGrid() {
        return machineService.getMachinesForCurrentScope().stream()
                .map(machine -> MachineStatusGridItem.builder()
                        .machineId(machine.getId())
                        .machineName(machine.getName())
                        .departmentName(machine.getDepartment().getName())
                        .status(machine.getStatus())
                        .statusSince(machine.getStatusSince())
                        .materialTrackingCode(findCurrentMaterialCode(machine.getId()))
                        .build())
                .toList();
    }

    public List<ProductionTrendItem> getProductionTrend(int days) {
        OffsetDateTime start = LocalDate.now(ZoneOffset.UTC).minusDays(days - 1L).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.now(ZoneOffset.UTC);
        List<ProductionRecord> records = productionRecordRepository.findForDashboardRange(start, end);
        Map<LocalDate, BigDecimal> productionMap = new LinkedHashMap<>();
        Map<LocalDate, BigDecimal> wasteMap = new LinkedHashMap<>();

        for (int index = 0; index < days; index++) {
            LocalDate date = start.toLocalDate().plusDays(index);
            productionMap.put(date, BigDecimal.ZERO);
            wasteMap.put(date, BigDecimal.ZERO);
        }

        records.forEach(record -> {
            LocalDate date = record.getRecordedAt().toLocalDate();
            productionMap.computeIfPresent(date, (key, value) -> value.add(record.getOutputQty()));
            wasteMap.computeIfPresent(date, (key, value) -> value.add(safeSubtract(record.getInputQty(), record.getOutputQty())));
        });

        return productionMap.entrySet().stream()
                .map(entry -> ProductionTrendItem.builder()
                        .date(entry.getKey())
                        .production(entry.getValue())
                        .waste(wasteMap.get(entry.getKey()))
                        .build())
                .toList();
    }

    public List<DepartmentStatItem> getDepartmentStats() {
        Map<Long, AggregateHolder> aggregateMap = new LinkedHashMap<>();
        productionRecordRepository.findAllByOrderByRecordedAtDesc().forEach(record -> {
            AggregateHolder aggregate = aggregateMap.computeIfAbsent(record.getDepartment().getId(),
                    ignored -> new AggregateHolder(record.getDepartment().getId(), record.getDepartment().getName()));
            aggregate.production = aggregate.production.add(record.getOutputQty());
            aggregate.waste = aggregate.waste.add(safeSubtract(record.getInputQty(), record.getOutputQty()));
        });

        return aggregateMap.values().stream()
                .map(holder -> DepartmentStatItem.builder()
                        .departmentId(holder.departmentId)
                        .departmentName(holder.departmentName)
                        .totalProduction(holder.production)
                        .totalWaste(holder.waste)
                        .wasteRate(holder.production.compareTo(BigDecimal.ZERO) == 0
                                ? BigDecimal.ZERO
                                : holder.waste.divide(holder.production.add(holder.waste), 3, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100)))
                        .build())
                .toList();
    }

    public List<WasteMachineItem> getTopWasteMachines() {
        Map<Long, List<ProductionRecord>> byMachine = new LinkedHashMap<>();
        productionRecordRepository.findAllByOrderByRecordedAtDesc()
                .forEach(record -> byMachine.computeIfAbsent(record.getMachine().getId(), ignored -> new ArrayList<>()).add(record));

        return byMachine.values().stream()
                .map(records -> {
                    ProductionRecord latest = records.getFirst();
                    BigDecimal averageRate = records.stream()
                            .map(ProductionRecord::getWasteRate)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(records.size()), 3, RoundingMode.HALF_UP);
                    String trend = "flat";
                    if (records.size() > 1) {
                        int comparison = latest.getWasteRate().compareTo(records.get(1).getWasteRate());
                        trend = comparison > 0 ? "up" : comparison < 0 ? "down" : "flat";
                    }
                    return WasteMachineItem.builder()
                            .machineId(latest.getMachine().getId())
                            .machineName(latest.getMachine().getName())
                            .departmentName(latest.getDepartment().getName())
                            .wasteRate(averageRate)
                            .trend(trend)
                            .build();
                })
                .sorted(Comparator.comparing(WasteMachineItem::getWasteRate).reversed())
                .limit(5)
                .toList();
    }

    private String findCurrentMaterialCode(Long machineId) {
        return productionRecordRepository.findAllByOrderByRecordedAtDesc().stream()
                .filter(record -> record.getMachine().getId().equals(machineId))
                .findFirst()
                .map(record -> record.getMaterial().getTrackingCode())
                .orElse(null);
    }

    private BigDecimal safeSubtract(BigDecimal left, BigDecimal right) {
        return left.subtract(right);
    }

    private static final class AggregateHolder {
        private final Long departmentId;
        private final String departmentName;
        private BigDecimal production = BigDecimal.ZERO;
        private BigDecimal waste = BigDecimal.ZERO;

        private AggregateHolder(Long departmentId, String departmentName) {
            this.departmentId = departmentId;
            this.departmentName = departmentName;
        }
    }
}

