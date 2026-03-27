package com.audioextractor.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AudioProcessingException.class)
    public ResponseEntity<ErrorResponse> handleAudioProcessingException(AudioProcessingException ex) {
        HttpStatus status = switch (ex.getErrorCode()) {
            case FILE_EMPTY, INVALID_FILE_TYPE -> HttpStatus.BAD_REQUEST;
            case FILE_TOO_LARGE -> HttpStatus.PAYLOAD_TOO_LARGE;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        ErrorResponse error = ErrorResponse.of(
                ex.getErrorCode().name(),
                ex.getMessage(),
                status.value()
        );

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        ErrorResponse error = ErrorResponse.of(
                "FILE_TOO_LARGE",
                "File size exceeds the maximum allowed limit (50MB)",
                HttpStatus.PAYLOAD_TOO_LARGE.value()
        );

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = ErrorResponse.of(
                "INTERNAL_ERROR",
                "An unexpected error occurred: " + ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
