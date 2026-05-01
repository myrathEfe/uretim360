package com.meslite.common;

import java.time.OffsetDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private OffsetDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(null)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static ApiResponse<Void> failure(String message) {
        return ApiResponse.<Void>builder()
                .success(false)
                .data(null)
                .message(message)
                .timestamp(OffsetDateTime.now())
                .build();
    }
}

