package com.meslite.domain.user;

import com.meslite.common.ApiResponse;
import com.meslite.domain.machine.dto.MachineResponse;
import com.meslite.domain.user.dto.AssignMachinesRequest;
import com.meslite.domain.user.dto.UserCreateRequest;
import com.meslite.domain.user.dto.UserResponse;
import com.meslite.domain.user.dto.UserUpdateRequest;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.create(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Kullanıcı pasife alındı."));
    }

    @GetMapping("/{id}/machines")
    @PreAuthorize("hasAnyRole('ADMIN','FACTORY_MANAGER')")
    public ResponseEntity<ApiResponse<List<MachineResponse>>> getAssignedMachines(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAssignedMachines(id)));
    }

    @PostMapping("/{id}/machines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MachineResponse>>> assignMachines(
            @PathVariable Long id,
            @Valid @RequestBody AssignMachinesRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.assignMachines(id, request.getMachineIds())));
    }
}

