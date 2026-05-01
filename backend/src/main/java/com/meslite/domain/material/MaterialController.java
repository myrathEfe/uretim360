package com.meslite.domain.material;

import com.meslite.common.ApiResponse;
import com.meslite.domain.material.dto.MaterialCreateRequest;
import com.meslite.domain.material.dto.MaterialHistoryResponse;
import com.meslite.domain.material.dto.MaterialResponse;
import com.meslite.domain.material.dto.MaterialUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER')")
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(materialService.getAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@accessControlService.canAccessMaterial(authentication, #id)")
    public ResponseEntity<ApiResponse<MaterialResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(materialService.getById(id)));
    }

    @GetMapping("/tracking/{code}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MaterialResponse>> getByTrackingCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(materialService.getByTrackingCode(code)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SHIFT_SUPERVISOR')")
    public ResponseEntity<ApiResponse<MaterialResponse>> create(@Valid @RequestBody MaterialCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(materialService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SHIFT_SUPERVISOR') and @accessControlService.canAccessMaterial(authentication, #id)")
    public ResponseEntity<ApiResponse<MaterialResponse>> update(@PathVariable Long id, @Valid @RequestBody MaterialUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(materialService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SHIFT_SUPERVISOR') and @accessControlService.canAccessMaterial(authentication, #id)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Malzeme silindi."));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("@accessControlService.canAccessMaterial(authentication, #id)")
    public ResponseEntity<ApiResponse<List<MaterialHistoryResponse>>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(materialService.getHistory(id)));
    }
}
