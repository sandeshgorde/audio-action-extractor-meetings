package com.audioextractor.service;

import com.audioextractor.exception.AudioProcessingException;
import com.audioextractor.exception.AudioProcessingException.ErrorCode;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AudioUploadService {

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".mp3", ".wav", ".m4a", ".flac", ".ogg", ".wma", ".aac");

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

            Map<String, Object> parsed = parseJsonResponse(jsonResponse);
            return buildResult(storedFilename, file.getOriginalFilename(), file.getSize(), parsed);

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

        System.out.println("DEBUG - user.dir: " + System.getProperty("user.dir"));
        System.out.println("DEBUG - scriptPath: " + scriptPath);
        System.out.println("DEBUG - audioPath: " + absoluteAudioPath);
        System.out.println("DEBUG - pythonCommand: " + pythonCommand);

        try {
            ProcessBuilder pb = new ProcessBuilder(pythonCommand, scriptPath, absoluteAudioPath);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output = new BufferedReader(new InputStreamReader(process.getInputStream()))
                    .lines()
                    .collect(Collectors.joining());

            int exitCode = process.waitFor();
            System.out.println("DEBUG - Exit code: " + exitCode);
            System.out.println("DEBUG - Output: " + output);
            
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
        int errorIndex = json.indexOf("\"error\"");
        if (errorIndex == -1) return "Unknown error";
        int start = json.indexOf("\"", errorIndex + 7) + 1;
        int end = json.indexOf("\"", start);
        return end > start ? json.substring(start, end) : "Unknown error";
    }

    private UploadResult buildResult(String filename, String originalName, long size, Map<String, Object> parsed) {
        String transcript = (String) parsed.getOrDefault("text", "");
        String language = (String) parsed.getOrDefault("language", "unknown");
        
        @SuppressWarnings("unchecked")
        List<Map<String, String>> actionItemsRaw = (List<Map<String, String>>) parsed.getOrDefault("action_items", new ArrayList<>());
        List<ActionItem> actionItems = actionItemsRaw.stream()
                .map(ai -> new ActionItem(
                        ai.getOrDefault("task", ""),
                        ai.getOrDefault("assigned_to", "Unassigned"),
                        ai.getOrDefault("deadline", "Not specified"),
                        ai.getOrDefault("priority", "medium")
                ))
                .collect(Collectors.toList());

        @SuppressWarnings("unchecked")
        Map<String, Object> summaryRaw = (Map<String, Object>) parsed.getOrDefault("summary", new HashMap<>());
        Summary summary = new Summary(
                (String) summaryRaw.getOrDefault("summary", ""),
                (int) summaryRaw.getOrDefault("action_items_count", 0),
                (String) summaryRaw.getOrDefault("duration_estimate", "unknown")
        );

        return new UploadResult(filename, originalName, size, transcript, language, actionItems, summary);
    }

    private Map<String, Object> parseJsonResponse(String json) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("text", extractJsonValue(json, "text"));
        result.put("language", extractJsonValue(json, "language"));
        result.put("action_items", extractJsonArray(json, "action_items"));
        result.put("summary", extractJsonObject(json, "summary"));
        
        return result;
    }

    private String extractJsonValue(String json, String key) {
        String pattern = "\"" + key + "\"";
        int keyIndex = json.indexOf(pattern);
        if (keyIndex == -1) return "";
        
        int colonIndex = json.indexOf(":", keyIndex);
        if (colonIndex == -1) return "";
        
        int startIndex = colonIndex + 1;
        while (startIndex < json.length() && Character.isWhitespace(json.charAt(startIndex))) {
            startIndex++;
        }
        
        if (startIndex >= json.length()) return "";
        
        char startChar = json.charAt(startIndex);
        if (startChar == '"') {
            int endQuote = json.indexOf('"', startIndex + 1);
            return endQuote > startIndex ? json.substring(startIndex + 1, endQuote) : "";
        } else if (startChar == '{' || startChar == '[') {
            return "";
        } else {
            int endIndex = startIndex;
            while (endIndex < json.length() && json.charAt(endIndex) != ',' && json.charAt(endIndex) != '}') {
                endIndex++;
            }
            return json.substring(startIndex, endIndex).trim();
        }
    }

    private List<Map<String, String>> extractJsonArray(String json, String key) {
        List<Map<String, String>> items = new ArrayList<>();
        String arrayPattern = "\"" + key + "\"";
        int arrayIndex = json.indexOf(arrayPattern);
        if (arrayIndex == -1) return items;
        
        int bracketStart = json.indexOf("[", arrayIndex);
        int bracketEnd = json.indexOf("]", bracketStart);
        if (bracketStart == -1 || bracketEnd == -1) return items;
        
        String arrayContent = json.substring(bracketStart + 1, bracketEnd);
        
        int objectStart = 0;
        while (objectStart < arrayContent.length()) {
            int objStart = arrayContent.indexOf("{", objectStart);
            if (objStart == -1) break;
            int objEnd = arrayContent.indexOf("}", objStart);
            if (objEnd == -1) break;
            
            String objContent = arrayContent.substring(objStart, objEnd + 1);
            Map<String, String> item = new HashMap<>();
            item.put("task", extractJsonValue(objContent, "task"));
            item.put("assigned_to", extractJsonValue(objContent, "assigned_to"));
            item.put("deadline", extractJsonValue(objContent, "deadline"));
            item.put("priority", extractJsonValue(objContent, "priority"));
            items.add(item);
            
            objectStart = objEnd + 1;
        }
        
        return items;
    }

    private Map<String, Object> extractJsonObject(String json, String key) {
        Map<String, Object> obj = new HashMap<>();
        String objectPattern = "\"" + key + "\"";
        int objectIndex = json.indexOf(objectPattern);
        if (objectIndex == -1) return obj;
        
        int braceStart = json.indexOf("{", objectIndex);
        int braceEnd = json.indexOf("}", braceStart);
        if (braceStart == -1 || braceEnd == -1) return obj;
        
        String objectContent = json.substring(braceStart + 1, braceEnd);
        
        obj.put("summary", extractJsonValue(objectContent, "summary"));
        
        String countStr = extractJsonValue(objectContent, "action_items_count");
        obj.put("action_items_count", countStr.isEmpty() ? 0 : Integer.parseInt(countStr));
        
        obj.put("duration_estimate", extractJsonValue(objectContent, "duration_estimate"));
        
        return obj;
    }
}
