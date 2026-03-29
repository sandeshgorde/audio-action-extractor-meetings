package com.audioextractor.service;

import com.audioextractor.exception.AudioProcessingException;
import com.audioextractor.exception.AudioProcessingException.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AudioUploadService {

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".mp3", ".wav", ".m4a", ".flac", ".ogg", ".wma", ".aac");

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.python.script:scripts/transcribe.py}")
    private String pythonScriptPath;

    public record ActionItem(String task, String assignedTo, String deadline, String priority) {}
    public record Summary(String summary, int actionItemsCount, String durationEstimate) {}
    public record UploadResult(String filename, String originalName, long size, String transcript, 
                               String language, List<ActionItem> actionItems, Summary summary) {}

    public UploadResult uploadAndTranscribe(MultipartFile file) {
        validateFile(file);

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String extension = getFileExtension(file.getOriginalFilename());
            String storedFilename = UUID.randomUUID().toString() + extension;
            Path targetPath = uploadPath.resolve(storedFilename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String jsonResponse = transcribeAudio(targetPath.toString());
            
            if (jsonResponse.contains("\"error\"")) {
                String errorMsg = extractErrorMessage(jsonResponse);
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, new Exception(errorMsg));
            }

            return buildResult(storedFilename, file.getOriginalFilename(), file.getSize(), jsonResponse);

        } catch (AudioProcessingException e) {
            throw e;
        } catch (IOException e) {
            throw new AudioProcessingException(ErrorCode.UPLOAD_FAILED, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AudioProcessingException(ErrorCode.FILE_EMPTY);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AudioProcessingException(ErrorCode.FILE_TOO_LARGE);
        }

        String filename = file.getOriginalFilename();
        if (filename != null) {
            String lower = filename.toLowerCase();
            boolean validExtension = ALLOWED_EXTENSIONS.stream()
                    .anyMatch(lower::endsWith);
            if (!validExtension) {
                throw new AudioProcessingException(ErrorCode.INVALID_FILE_TYPE);
            }
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".mp3";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String transcribeAudio(String audioPath) {
        String pythonCommand = System.getProperty("python.command", "python3");
        Path scriptFullPath = Paths.get(System.getProperty("user.dir")).resolve(pythonScriptPath).normalize();
        String scriptPath = scriptFullPath.toString();
        String absoluteAudioPath = Paths.get(audioPath).normalize().toString();

        try {
            ProcessBuilder pb = new ProcessBuilder(pythonCommand, scriptPath, absoluteAudioPath);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output = new BufferedReader(new InputStreamReader(process.getInputStream()))
                    .lines()
                    .collect(Collectors.joining());

            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                if (output.contains("python") || output.contains("not found")) {
                    throw new AudioProcessingException(ErrorCode.PYTHON_NOT_FOUND);
                }
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, 
                        new Exception("Exit code: " + exitCode + ", Output: " + output));
            }

            if (output.contains("\"error\"")) {
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, 
                        new Exception("Whisper error: " + output));
            }

            return output;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_TIMEOUT, e);
        } catch (AudioProcessingException e) {
            throw e;
        } catch (IOException e) {
            if (e.getMessage() != null && e.getMessage().contains("cannot run program")) {
                throw new AudioProcessingException(ErrorCode.PYTHON_NOT_FOUND, e);
            }
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, e);
        }
    }

    private String extractErrorMessage(String json) {
        try {
            return objectMapper.readTree(json).get("error").asText();
        } catch (Exception e) {
            return "Unknown error";
        }
    }

    private UploadResult buildResult(String filename, String originalName, long size, String jsonResponse) {
        try {
            var root = objectMapper.readTree(jsonResponse);
            
            String transcript = root.has("text") ? root.get("text").asText() : "";
            String language = root.has("language") ? root.get("language").asText() : "unknown";
            
            List<ActionItem> actionItems = new ArrayList<>();
            if (root.has("action_items") && root.get("action_items").isArray()) {
                var actionItemsArray = root.get("action_items");
                for (var ai : actionItemsArray) {
                    actionItems.add(new ActionItem(
                            ai.has("task") ? ai.get("task").asText() : "",
                            ai.has("assigned_to") ? ai.get("assigned_to").asText() : "Unassigned",
                            ai.has("deadline") ? ai.get("deadline").asText() : "Not specified",
                            ai.has("priority") ? ai.get("priority").asText() : "medium"
                    ));
                }
            }
            
            Summary summary = new Summary(
                    root.has("summary") && root.get("summary").has("summary") 
                        ? root.get("summary").get("summary").asText() : "",
                    root.has("summary") && root.get("summary").has("action_items_count") 
                        ? root.get("summary").get("action_items_count").asInt() : 0,
                    root.has("summary") && root.get("summary").has("duration_estimate") 
                        ? root.get("summary").get("duration_estimate").asText() : "unknown"
            );

            return new UploadResult(filename, originalName, size, transcript, language, actionItems, summary);
            
        } catch (IOException e) {
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, e);
        }
    }
}
