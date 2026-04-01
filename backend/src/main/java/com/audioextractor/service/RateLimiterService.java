package com.audioextractor.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimiterService {
    
    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);
    
    private static final int MAX_REQUESTS = 5;
    private static final long WINDOW_MS = 60_000;
    
    private final ConcurrentHashMap<String, RateLimitEntry> clients = new ConcurrentHashMap<>();
    
    public record RateLimitResult(boolean allowed, int remaining, long resetInSeconds) {}
    
    public RateLimitResult checkRateLimit(String clientId) {
        long now = System.currentTimeMillis();
        
        clients.compute(clientId, (key, entry) -> {
            if (entry == null || now - entry.windowStart > WINDOW_MS) {
                return new RateLimitEntry(new AtomicInteger(1), now);
            }
            entry.count.incrementAndGet();
            return entry;
        });
        
        RateLimitEntry entry = clients.get(clientId);
        int count = entry.count.get();
        long resetIn = Math.max(0, (entry.windowStart + WINDOW_MS - now) / 1000);
        
        if (count > MAX_REQUESTS) {
            log.warn("Rate limit exceeded for client: {} ({} requests)", clientId, count);
            return new RateLimitResult(false, 0, resetIn);
        }
        
        int remaining = MAX_REQUESTS - count;
        return new RateLimitResult(true, remaining, resetIn);
    }
    
    public void cleanup() {
        long cutoff = System.currentTimeMillis() - WINDOW_MS * 2;
        clients.entrySet().removeIf(e -> e.getValue().windowStart < cutoff);
    }
    
    private record RateLimitEntry(AtomicInteger count, long windowStart) {}
}
