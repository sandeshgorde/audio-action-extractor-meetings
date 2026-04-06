package com.audioextractor.service;

import com.audioextractor.exception.AudioProcessingException;
import com.audioextractor.exception.AudioProcessingException.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GroqService {

    private static final Logger log = LoggerFactory.getLogger(GroqService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private String getApiKey() {
        String key = System.getenv("GROQ_API_KEY");
        if (key != null && !key.isEmpty()) {
            return key;
        }
        return groqApiKey;
    }

    @Value("${groq.api.url:https://api.groq.com}")
    private String groqApiUrl;

    private static final String WHISPER_MODEL = "whisper-large-v3";
    private static final String LLM_MODEL = "llama-3.3-70b-versatile";
    private static final int MAX_DURATION_SECONDS = 120;

    public record TranscriptionResult(String text, Double duration, String language) {}
    public record ActionItem(String task, String assignedTo, String deadline, String deadlineDate, String priority, String summary) {}
    public record SummaryResult(String summary, int actionItemsCount, String durationEstimate) {}

    public GroqService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public TranscriptionResult transcribe(MultipartFile file) {
        try {
            String url = groqApiUrl + "/openai/v1/audio/transcriptions";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(getApiKey());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            body.add("model", WHISPER_MODEL);
            body.add("response_format", "verbose_json");
            body.add("language", "en");

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            log.info("Calling Groq Whisper API for transcription...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.get("text");

            if (textNode == null || textNode.isNull()) {
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, 
                    new Exception("Empty transcription response"));
            }

            String text = textNode.asText();
            Double duration = root.has("duration") ? root.get("duration").asDouble() : null;

            if (duration != null && duration > MAX_DURATION_SECONDS) {
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED,
                    new Exception("Audio too long: " + duration + "s (max: " + MAX_DURATION_SECONDS + "s)"));
            }

            log.info("Transcription complete: {} chars", text.length());
            return new TranscriptionResult(text, duration, "en");

        } catch (RestClientException e) {
            log.error("Groq API error during transcription: {}", e.getMessage());
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, e);
        } catch (IOException e) {
            throw new AudioProcessingException(ErrorCode.UPLOAD_FAILED, e);
        }
    }

    public List<ActionItem> extractActionItems(String transcript) {
        String prompt = """
            You are a meeting assistant. Analyze the following meeting transcript and extract action items.

            For each action item, identify and return a JSON object with these fields:
            - task: The specific action to be taken (clear and concise, max 100 chars)
            - assigned_to: The person responsible (extract from context, or "Unassigned" if not mentioned)
            - deadline: The raw deadline text (e.g., "by Friday", "next Monday", "end of week")
            - deadline_date: The deadline in ISO format (YYYY-MM-DD), or null if cannot determine
            - priority: "high", "medium", or "low" (based on urgency)
            - summary: Brief context about this task (1 sentence, why this task matters)

            Return ONLY a valid JSON array of action items. No markdown, no explanations.
            Example: [{"task":"Review budget","assigned_to":"John","deadline":"Friday","deadline_date":null,"priority":"high","summary":"Need to review Q2 budget"}]

            Transcript: """ + transcript;

        String response = callLLM(prompt, 1024);
        return parseActionItems(response, transcript);
    }

    public SummaryResult generateSummary(String transcript, int actionItemsCount, Double duration) {
        String prompt = """
            Summarize this meeting transcript in 2-3 sentences. Focus on main topics and outcomes.
            Return ONLY valid JSON: {"summary":"your summary here"}
            Transcript: """ + transcript;

        String response = callLLM(prompt, 256);
        return parseSummary(response, actionItemsCount, duration);
    }

    private String callLLM(String prompt, int maxTokens) {
        try {
            String url = groqApiUrl + "/openai/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(getApiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                "model", LLM_MODEL,
                "messages", List.of(
                    Map.of("role", "system", "content", "You are a meeting assistant. Respond ONLY with valid JSON."),
                    Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3,
                "max_tokens", maxTokens
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.info("Calling Groq LLM API...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.get("choices");

            if (choices == null || choices.isNull() || choices.isEmpty()) {
                throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, 
                    new Exception("Empty LLM response"));
            }

            String content = choices.get(0).get("message").get("content").asText();
            content = content.replaceAll("^```json\\s*", "").replaceAll("^```", "").replaceAll("\\s*```$", "").trim();

            log.info("LLM response received");
            return content;

        } catch (RestClientException | com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("Groq LLM API error: {}", e.getMessage());
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, e);
        } catch (Exception e) {
            log.error("Unexpected error in LLM call: {}", e.getMessage());
            throw new AudioProcessingException(ErrorCode.TRANSCRIPTION_FAILED, e);
        }
    }

    private List<ActionItem> parseActionItems(String response, String transcript) {
        try {
            JsonNode items = objectMapper.readTree(response);
            if (!items.isArray()) {
                return createFallbackActionItems(transcript);
            }

            List<ActionItem> actionItems = new ArrayList<>();
            for (JsonNode item : items) {
                String task = item.has("task") ? item.get("task").asText() : "";
                if (task.isBlank()) continue;

                String assignedTo = item.has("assigned_to") ? item.get("assigned_to").asText() : "Unassigned";
                String deadline = item.has("deadline") ? item.get("deadline").asText() : "Not specified";
                String deadlineDate = item.has("deadline_date") && !item.get("deadline_date").isNull() 
                    ? item.get("deadline_date").asText() : null;
                String priority = item.has("priority") ? item.get("priority").asText() : "medium";
                String summary = item.has("summary") ? item.get("summary").asText() : "";

                actionItems.add(new ActionItem(task, assignedTo, deadline, deadlineDate, priority, summary));
            }

            return actionItems.isEmpty() ? createFallbackActionItems(transcript) : actionItems;

        } catch (Exception e) {
            log.error("Failed to parse action items: {}", e.getMessage());
            return createFallbackActionItems(transcript);
        }
    }

    private List<ActionItem> createFallbackActionItems(String transcript) {
        String[] sentences = transcript.split("[.!?]\\s+");
        List<ActionItem> items = new ArrayList<>();
        for (int i = 0; i < Math.min(5, sentences.length); i++) {
            String sentence = sentences[i].trim();
            if (sentence.length() > 10) {
                items.add(new ActionItem(
                    sentence.length() > 100 ? sentence.substring(0, 100) : sentence,
                    "Unassigned", "Not specified", null, "medium", sentence
                ));
            }
        }
        return items;
    }

    private SummaryResult parseSummary(String response, int actionItemsCount, Double duration) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String summary = root.has("summary") ? root.get("summary").asText() : createFallbackSummary("");
            String durationStr = duration != null ? String.format("%.1f seconds", duration) 
                : "unknown";
            return new SummaryResult(summary, actionItemsCount, durationStr);
        } catch (Exception e) {
            return new SummaryResult(createFallbackSummary(""), actionItemsCount, "unknown");
        }
    }

    private String createFallbackSummary(String transcript) {
        if (transcript.isBlank()) return "Meeting discussion completed.";
        String[] sentences = transcript.split("[.!?]\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(3, sentences.length); i++) {
            sb.append(sentences[i].trim()).append(". ");
        }
        return sb.toString().trim();
    }
}