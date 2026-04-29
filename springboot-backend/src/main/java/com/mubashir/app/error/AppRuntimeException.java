package com.mubashir.app.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

public class AppRuntimeException extends RuntimeException {
    @Getter
    private final String message;
    @Getter
    private final int statusCode;

    public AppRuntimeException(String message) {
        super(message);
        this.message = message;
        this.statusCode = 500;
    }

    public AppRuntimeException(String message, HttpStatus status) {
        super(message);
        this.message =message;
        this.statusCode = status.value();
    }

}