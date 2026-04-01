package com.audioextractor.controller;

import com.audioextractor.service.AudioUploadService;
import com.audioextractor.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
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
    private final RateLimiterService rateLimiterService;

    public AudioController(AudioUploadService audioUploadService, RateLimiterService rateLimiterService) {
        this.audioUploadService = audioUploadService;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/upload-audio")
    public ResponseEntity<Map<String, Object>> uploadAudio(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        
        String clientId = getClientId(request);
        RateLimiterService.RateLimitResult rateLimit = rateLimiterService.checkRateLimit(clientId);
        
        if (!rateLimit.allowed()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Rate limit exceeded. Try again in " + rateLimit.resetInSeconds() + " seconds.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("X-RateLimit-Remaining", "0")
                    .header("X-RateLimit-Reset", String.valueOf(rateLimit.resetInSeconds()))
                    .body(error);
        }
        
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

        return ResponseEntity.ok()
                .header("X-RateLimit-Remaining", String.valueOf(rateLimit.remaining()))
                .header("X-RateLimit-Reset", String.valueOf(rateLimit.resetInSeconds()))
                .body(response);
    }
    
    private String getClientId(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }
        return request.getRemoteAddr();
    }
}
