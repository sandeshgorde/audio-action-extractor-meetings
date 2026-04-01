package com.audioextractor.service;

import com.audioextractor.exception.AudioProcessingException;
import com.audioextractor.exception.AudioProcessingException.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AudioUploadService {

    private static final Logger log = LoggerFactory.getLogger(AudioUploadService.class);

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".mp3", ".wav", ".m4a", ".flac", ".ogg", ".wma", ".aac");

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.python.script:scripts/transcribe.py}")
    private String pythonScriptPath;

    public record ActionItem(String task, String assignedTo, String deadline, String deadlineDate, String priority, String summary) {}
    public record Summary(String summary, int actionItemsCount, String durationEstimate) {}
    public record UploadResult(String filename, String originalName, long size, String transcript, 
                               String language, List<ActionItem> actionItems, Summary summary) {}

    public UploadResult uploadAndTranscribe(MultipartFile file) {
        log.debug("Starting upload for file: {}", file.getOriginalFilename());
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
            log.debug("File saved to: {}", targetPath);

            log.debug("Starting transcription for: {}", storedFilename);
            String jsonResponse = transcribeAudio(targetPath.toString());
            
            if (jsonResponse.contains("\"error\"")) {
                String errorMsg = extractErrorMessage(jsonResponse);
                log.error("Transcription error: {}", errorMsg);
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, new Exception(errorMsg));
            }

            return buildResult(storedFilename, file.getOriginalFilename(), file.getSize(), jsonResponse);

        } catch (AudioProcessingException e) {
            throw e;
        } catch (IOException e) {
            log.error("File upload failed: {}", e.getMessage());
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
        String venvPython = Paths.get(System.getProperty("user.dir")).resolve("venv/bin/python").normalize().toString();
        String pythonCommand = System.getProperty("python.command", venvPython);
        Path scriptFullPath = Paths.get(System.getProperty("user.dir")).resolve(pythonScriptPath).normalize();
        String scriptPath = scriptFullPath.toString();
        String absoluteAudioPath = Paths.get(audioPath).normalize().toString();

        log.debug("Running transcription - Python: {}, Script: {}, Audio: {}", pythonCommand, scriptPath, absoluteAudioPath);

        try {
            ProcessBuilder pb = new ProcessBuilder(pythonCommand, scriptPath, absoluteAudioPath);
            pb.redirectErrorStream(true);
            Map<String, String> env = pb.environment();
            String apiKey = System.getenv("GROQ_API_KEY");
            if (apiKey != null && !apiKey.isEmpty()) {
                env.put("GROQ_API_KEY", apiKey);
            }
            Process process = pb.start();

            String output = new BufferedReader(new InputStreamReader(process.getInputStream()))
                    .lines()
                    .collect(Collectors.joining());

            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                log.error("Transcription failed with exit code: {}", exitCode);
                if (output.contains("python") || output.contains("not found")) {
                    throw new AudioProcessingException(ErrorCode.PYTHON_NOT_FOUND);
                }
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, 
                        new Exception("Exit code: " + exitCode + ", Output: " + output));
            }

            if (output.contains("\"error\"")) {
                log.error("Transcription returned error: {}", output);
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, 
                        new Exception("Groq transcription error: " + output));
            }

            log.debug("Transcription completed successfully");
            return output;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Transcription interrupted: {}", e.getMessage());
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_TIMEOUT, e);
        } catch (AudioProcessingException e) {
            throw e;
        } catch (IOException e) {
            if (e.getMessage() != null && e.getMessage().contains("cannot run program")) {
                log.error("Python not found: {}", e.getMessage());
                throw new AudioProcessingException(ErrorCode.PYTHON_NOT_FOUND, e);
            }
            log.error("Transcription IO error: {}", e.getMessage());
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, e);
        }
    }

    private String extractErrorMessage(String json) {
        try {
            var root = objectMapper.readTree(json);
            if (root.has("error") && !root.get("error").isNull()) {
                return root.get("error").asText();
            }
            return "Unknown error";
        } catch (Exception e) {
            return "Unknown error";
        }
    }

    private UploadResult buildResult(String filename, String originalName, long size, String jsonResponse) {
        try {
            var root = objectMapper.readTree(jsonResponse);
            
            var data = root.has("data") ? root.get("data") : root;
            
            String transcript = data.has("raw_transcript") ? data.get("raw_transcript").asText() : "";
            String language = data.has("language") ? data.get("language").asText() : "en";
            
            List<ActionItem> actionItems = new ArrayList<>();
            if (data.has("tasks") && data.get("tasks").isArray()) {
                var tasksArray = data.get("tasks");
                for (var task : tasksArray) {
                    String deadlineDate = null;
                    if (task.has("deadline_date") && !task.get("deadline_date").isNull()) {
                        deadlineDate = task.get("deadline_date").asText();
                    }
                    actionItems.add(new ActionItem(
                            task.has("task") ? task.get("task").asText() : "",
                            task.has("assigned_to") ? task.get("assigned_to").asText() : "Unassigned",
                            task.has("deadline") ? task.get("deadline").asText() : "Not specified",
                            deadlineDate,
                            task.has("priority") ? task.get("priority").asText() : "medium",
                            task.has("summary") ? task.get("summary").asText() : ""
                    ));
                }
            }
            
            String summaryText = "";
            int actionCount = actionItems.size();
            String duration = "unknown";
            
            if (data.has("summary")) {
                var summaryNode = data.get("summary");
                if (summaryNode.isObject()) {
                    summaryText = summaryNode.has("summary") ? summaryNode.get("summary").asText() : "";
                    actionCount = summaryNode.has("action_items_count") ? summaryNode.get("action_items_count").asInt() : actionItems.size();
                    duration = summaryNode.has("duration") ? summaryNode.get("duration").asText() : "unknown";
                } else if (summaryNode.isTextual()) {
                    summaryText = summaryNode.asText();
                }
            }
            
            Summary summary = new Summary(summaryText, actionCount, duration);

            return new UploadResult(filename, originalName, size, transcript, language, actionItems, summary);
            
        } catch (IOException e) {
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, e);
        }
    }
}
