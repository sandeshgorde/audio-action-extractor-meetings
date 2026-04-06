package com.audioextractor.controller;

import com.audioextractor.service.GroqService;
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
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://audio-action-extractor-meetings.vercel.app"
})
public class AudioController {

    private final GroqService groqService;
    private final RateLimiterService rateLimiterService;

    public AudioController(GroqService groqService, RateLimiterService rateLimiterService) {
        this.groqService = groqService;
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

        GroqService.TranscriptionResult transcription = groqService.transcribe(file);
        List<GroqService.ActionItem> actionItems = groqService.extractActionItems(transcription.text());
        GroqService.SummaryResult summary = groqService.generateSummary(transcription.text(), actionItems.size(), transcription.duration());

        List<Map<String, Object>> actionItemMaps = actionItems.stream()
                .map(ai -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("task", ai.task());
                    item.put("assigned_to", ai.assignedTo());
                    item.put("deadline", ai.deadline());
                    if (ai.deadlineDate() != null) {
                        item.put("deadline_date", ai.deadlineDate());
                    }
                    item.put("priority", ai.priority());
                    item.put("summary", ai.summary() != null ? ai.summary() : "");
                    return item;
                })
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of(
                "raw_transcript", transcription.text(),
                "language", transcription.language(),
                "tasks", actionItemMaps,
                "summary", summary.summary(),
                "action_items_count", summary.actionItemsCount(),
                "duration", summary.durationEstimate()
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