package com.meslite.domain.shift;

import com.meslite.common.ApiResponse;
import com.meslite.domain.shift.dto.ShiftCreateRequest;
import com.meslite.domain.shift.dto.ShiftResponse;
import com.meslite.domain.shift.dto.ShiftUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ShiftResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(shiftService.getAll()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SHIFT_SUPERVISOR')")
    public ResponseEntity<ApiResponse<ShiftResponse>> create(@Valid @RequestBody ShiftCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(shiftService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SHIFT_SUPERVISOR') and @accessControlService.canAccessShift(authentication, #id)")
    public ResponseEntity<ApiResponse<ShiftResponse>> update(@PathVariable Long id, @Valid @RequestBody ShiftUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(shiftService.update(id, request)));
    }

    @PatchMapping("/{id}/end")
    @PreAuthorize("hasAnyRole('ADMIN','SHIFT_SUPERVISOR') and @accessControlService.canAccessShift(authentication, #id)")
    public ResponseEntity<ApiResponse<ShiftResponse>> endShift(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(shiftService.endShift(id)));
    }
}

