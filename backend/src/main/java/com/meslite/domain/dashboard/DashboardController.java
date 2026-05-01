package com.meslite.domain.dashboard;

import com.meslite.common.ApiResponse;
import com.meslite.domain.dashboard.dto.DashboardSummaryResponse;
import com.meslite.domain.dashboard.dto.DepartmentStatItem;
import com.meslite.domain.dashboard.dto.MachineStatusGridItem;
import com.meslite.domain.dashboard.dto.ProductionTrendItem;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER')")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSummary()));
    }

    @GetMapping("/machine-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MachineStatusGridItem>>> getMachineStatus() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMachineStatusGrid()));
    }

    @GetMapping("/production-trend")
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER')")
    public ResponseEntity<ApiResponse<List<ProductionTrendItem>>> getProductionTrend(@RequestParam(defaultValue = "7") int days) {
        int normalizedDays = days == 30 ? 30 : 7;
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getProductionTrend(normalizedDays)));
    }

    @GetMapping("/department-stats")
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER')")
    public ResponseEntity<ApiResponse<List<DepartmentStatItem>>> getDepartmentStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDepartmentStats()));
    }
}
