package com.audioextractor.controller;

import com.audioextractor.exception.AudioProcessingException;
import com.audioextractor.service.AudioUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AudioController {

    private final AudioUploadService audioUploadService;

    public AudioController(AudioUploadService audioUploadService) {
        this.audioUploadService = audioUploadService;
    }

    @PostMapping("/upload-audio")
    public ResponseEntity<Map<String, Object>> uploadAudio(@RequestParam("file") MultipartFile file) {
        AudioUploadService.UploadResult result = audioUploadService.uploadAndTranscribe(file);

        List<Map<String, String>> actionItems = result.actionItems().stream()
                .map(ai -> Map.of(
                        "task", ai.task(),
                        "assigned_to", ai.assignedTo(),
                        "deadline", ai.deadline(),
                        "priority", ai.priority(),
                        "summary", ai.summary() != null ? ai.summary() : ""
                ))
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "File processed successfully");
        response.put("filename", result.filename());
        response.put("originalName", result.originalName());
        response.put("size", result.size());
        response.put("transcript", result.transcript());
        response.put("language", result.language());
        response.put("action_items", actionItems);
        response.put("summary", Map.of(
                "text", result.summary().summary(),
                "action_items_count", result.summary().actionItemsCount(),
                "duration_estimate", result.summary().durationEstimate()
        ));

        return ResponseEntity.ok(response);
    }
}
