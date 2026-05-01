package com.meslite.domain.production;

import com.meslite.common.ApiResponse;
import com.meslite.domain.production.dto.ProductionRecordCreateRequest;
import com.meslite.domain.production.dto.ProductionRecordResponse;
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
@RequestMapping("/api/production-records")
@RequiredArgsConstructor
public class ProductionRecordController {

    private final ProductionRecordService productionRecordService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER','SHIFT_SUPERVISOR','OPERATOR')")
    public ResponseEntity<ApiResponse<List<ProductionRecordResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(productionRecordService.getAllScoped()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SHIFT_SUPERVISOR','OPERATOR')")
    public ResponseEntity<ApiResponse<ProductionRecordResponse>> create(@Valid @RequestBody ProductionRecordCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productionRecordService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER','SHIFT_SUPERVISOR','OPERATOR') and @accessControlService.canAccessProductionRecord(authentication, #id)")
    public ResponseEntity<ApiResponse<ProductionRecordResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductionRecordCreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(productionRecordService.update(id, request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@accessControlService.canAccessProductionRecord(authentication, #id)")
    public ResponseEntity<ApiResponse<ProductionRecordResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productionRecordService.getById(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER','SHIFT_SUPERVISOR','OPERATOR') and @accessControlService.canAccessProductionRecord(authentication, #id)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productionRecordService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Üretim kaydı silindi."));
    }
}
