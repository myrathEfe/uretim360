package com.meslite.domain.alert;

import com.meslite.common.ApiResponse;
import com.meslite.domain.alert.dto.AlertResponse;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER','SHIFT_SUPERVISOR')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlerts() {
        return ResponseEntity.ok(ApiResponse.success(alertService.getAlerts()));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("@accessControlService.canAccessAlert(authentication, #id)")
    public ResponseEntity<ApiResponse<AlertResponse>> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(alertService.markRead(id)));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", alertService.getUnreadCount())));
    }
}

