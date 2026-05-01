package com.meslite.domain.machine;

import com.meslite.common.ApiResponse;
import com.meslite.domain.machine.dto.MachineRequest;
import com.meslite.domain.machine.dto.MachineResponse;
import com.meslite.domain.machine.dto.MachineStatusLogResponse;
import com.meslite.domain.machine.dto.MachineStatusUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER')")
    public ResponseEntity<ApiResponse<List<MachineResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(machineService.getAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@accessControlService.canAccessMachine(authentication, #id)")
    public ResponseEntity<ApiResponse<MachineResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(machineService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MachineResponse>> create(@Valid @RequestBody MachineRequest request) {
        return ResponseEntity.ok(ApiResponse.success(machineService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MachineResponse>> update(@PathVariable Long id, @Valid @RequestBody MachineRequest request) {
        return ResponseEntity.ok(ApiResponse.success(machineService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        machineService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Makine pasife alındı."));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SHIFT_SUPERVISOR','OPERATOR') and @accessControlService.canAccessMachine(authentication, #id)")
    public ResponseEntity<ApiResponse<MachineResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody MachineStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(machineService.updateStatus(id, request)));
    }

    @GetMapping("/{id}/status-logs")
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER','SHIFT_SUPERVISOR') and @accessControlService.canAccessMachine(authentication, #id)")
    public ResponseEntity<ApiResponse<List<MachineStatusLogResponse>>> getStatusLogs(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(machineService.getStatusLogs(id)));
    }
}

