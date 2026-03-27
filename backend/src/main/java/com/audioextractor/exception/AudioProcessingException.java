package com.audioextractor.exception;

public class AudioProcessingException extends RuntimeException {
    
    private final ErrorCode errorCode;

    public enum ErrorCode {
        FILE_EMPTY("No file provided"),
        INVALID_FILE_TYPE("Invalid file type. Please upload an audio file"),
        FILE_TOO_LARGE("File size exceeds the maximum allowed limit"),
        UPLOAD_FAILED("Failed to save the uploaded file"),
        TRANSCRIPTION_FAILED("Failed to transcribe audio"),
        PYTHON_NOT_FOUND("Python interpreter not found"),
        TRANSCRIPTION_TIMEOUT("Transcription timed out");

        private final String message;

        ErrorCode(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }

    public AudioProcessingException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AudioProcessingException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
