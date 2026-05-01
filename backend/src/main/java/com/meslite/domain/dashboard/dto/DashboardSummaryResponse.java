package com.meslite.domain.dashboard.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardSummaryResponse {
    private SummaryCardResponse summary;
    private List<MachineStatusDistributionItem> machineStatusCounts;
    private List<WasteMachineItem> topWasteMachines;
    private List<DepartmentStatItem> departmentBreakdown;
}

