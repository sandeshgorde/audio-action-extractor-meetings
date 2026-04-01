#!/usr/bin/env python3
"""
Audio Transcription and Action Item Extraction using Groq API
Sign up at: https://console.groq.com/
Free tier: 500 minutes/month
"""

import sys
import json
import os
import re
import time
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)

VALID_PRIORITIES = {"high", "medium", "low"}
MAX_RETRIES = 2
REQUEST_TIMEOUT = 60
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".flac", ".ogg"}
MAX_FILE_SIZE = 50 * 1024 * 1024
MAX_DURATION_SECONDS = 120
BYTES_PER_SECOND_ESTIMATE = 256 * 1024

def validate_audio_file(file_path):
    if not os.path.exists(file_path):
        return "File not found"
    if not os.path.isfile(file_path):
        return "Path is not a file"
    
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return f"Invalid file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    
    try:
        size = os.path.getsize(file_path)
        if size == 0:
            return "File is empty"
        if size > MAX_FILE_SIZE:
            return f"File too large: {size / 1024 / 1024:.1f}MB (max: {MAX_FILE_SIZE / 1024 / 1024:.0f}MB)"
        
        estimated_duration = size / BYTES_PER_SECOND_ESTIMATE
        if estimated_duration > MAX_DURATION_SECONDS:
            return f"File too long: ~{estimated_duration / 60:.1f} minutes (max: {MAX_DURATION_SECONDS / 60} minutes)"
    except OSError as e:
        return f"Cannot read file: {e}"
    
    return None

def normalize_priority(priority):
    if not priority:
        return "medium"
    p = str(priority).lower().strip()
    if p in VALID_PRIORITIES:
        return p
    if p in ("urgent", "critical", "high_priority", "asap"):
        return "high"
    if p in ("low_priority", "when_possible", "defer"):
        return "low"
    return "medium"

def sanitize_task(task):
    if not task:
        return ""
    task = str(task).strip()
    task = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', task)
    task = re.sub(r'\s+', ' ', task)
    return task[:500]

def validate_action_item(item, index):
    if not isinstance(item, dict):
        return None
    task = sanitize_task(item.get("task", item.get("Task", "")))
    if not task:
        return None
    
    assigned = item.get("assigned_to") or item.get("assignedTo") or item.get("Assignee") or "Unassigned"
    deadline = item.get("deadline") or item.get("Deadline") or item.get("due") or "Not specified"
    
    return {
        "task": task,
        "assigned_to": str(assigned).strip() or "Unassigned",
        "deadline": str(deadline).strip() or "Not specified",
        "priority": normalize_priority(item.get("priority", item.get("Priority", "medium")))
    }

def validate_llm_response(raw_response, text, is_action_items=True):
    if is_action_items:
        if isinstance(raw_response, list):
            validated = [validate_action_item(item, i) for i, item in enumerate(raw_response)]
            validated = [item for item in validated if item is not None]
            return validated[:10]
        return []
    else:
        if isinstance(raw_response, dict) and "summary" in raw_response:
            return str(raw_response["summary"]).strip()[:500] or ""
        if isinstance(raw_response, str):
            return raw_response.strip()[:500] or ""
        return ""

def call_llm_with_retry(client, messages, model, max_tokens, retries=MAX_RETRIES):
    last_error = None
    
    for attempt in range(retries + 1):
        try:
            if attempt > 0:
                wait_time = 2 ** attempt
                logger.info(f"Retry attempt {attempt}/{retries} after {wait_time}s delay")
                time.sleep(wait_time)
            
            response = client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=0.3,
                max_tokens=max_tokens
            )
            return response
        
        except Exception as e:
            last_error = e
            error_msg = str(e)
            
            if "rate_limit" in error_msg.lower() or "429" in error_msg:
                logger.warning(f"Rate limited, attempt {attempt + 1}/{retries + 1}")
                continue
            elif attempt < retries:
                logger.warning(f"LLM call failed: {error_msg}, retrying...")
                continue
            else:
                logger.error(f"LLM call failed after {retries + 1} attempts: {error_msg}")
                return None
    
    return None

def extract_action_items_with_llm(client, text):
    prompt = """You are a meeting assistant. Analyze the following meeting transcript and extract action items.

For each action item, identify:
- task: The specific action to be taken (clear and concise, max 100 chars)
- assigned_to: The person responsible (extract from context, or "Unassigned" if not mentioned)
- deadline: When the task should be completed (extract from context, or "Not specified" if not mentioned)
- priority: "high", "medium", or "low" (based on urgency)

Return a JSON array of action items. Only include items that are actual tasks/assignments, not general discussions.

Transcript:""" + text

    messages = [
        {
            "role": "system",
            "content": "You are a meeting assistant. Respond ONLY with a valid JSON array. No markdown, no explanations."
        },
        {
            "role": "user", 
            "content": prompt
        }
    ]
    
    response = call_llm_with_retry(client, messages, "llama-3.3-70b-versatile", 1024)
    
    if not response:
        logger.warning("Using fallback action items due to LLM failure")
        return create_fallback_action_items(text)
    
    response_text = ""
    try:
        response_text = response.choices[0].message.content.strip()
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'^```\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        
        parsed = json.loads(response_text)
        validated = validate_llm_response(parsed, text, is_action_items=True)
        
        if not validated:
            logger.warning("LLM returned empty/invalid action items, using fallback")
            return create_fallback_action_items(text)
        
        return validated
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e} | Raw: {response_text[:200]}...")
        return create_fallback_action_items(text)
    except Exception as e:
        logger.error(f"LLM extraction failed: {e}")
        return create_fallback_action_items(text)

def create_fallback_action_items(text):
    sentences = re.split(r'[.!?]\s+', text)
    fallback_items = []
    for i, sentence in enumerate(sentences[:5]):
        sentence = sentence.strip()
        if len(sentence) > 10:
            fallback_items.append({
                "task": sentence[:100],
                "assigned_to": "Unassigned",
                "deadline": "Not specified",
                "priority": "medium"
            })
    return fallback_items

def generate_summary(client, text, action_items, duration=None):
    prompt = f"""Summarize this meeting transcript in 2-3 sentences. Focus on main topics and outcomes.

Transcript: {text}

Respond ONLY with valid JSON: {{"summary": "your summary here"}}
"""

    messages = [
        {
            "role": "system", 
            "content": "You are a meeting assistant. Respond ONLY with valid JSON."
        },
        {"role": "user", "content": prompt}
    ]
    
    response = call_llm_with_retry(client, messages, "llama-3.3-70b-versatile", 256)
    
    if not response:
        logger.warning("Using fallback summary due to LLM failure")
        summary_text = create_fallback_summary(text)
    else:
        try:
            response_text = response.choices[0].message.content.strip()
            response_text = re.sub(r'^```json\s*', '', response_text)
            response_text = re.sub(r'^```\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
            
            parsed = json.loads(response_text)
            summary_text = validate_llm_response(parsed, text, is_action_items=False)
            
            if not summary_text:
                summary_text = create_fallback_summary(text)
                
        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            summary_text = create_fallback_summary(text)
    
    duration_str = f"{duration:.1f} seconds" if duration else f"{len(text.split()) * 0.5:.1f} seconds"
    
    return {
        "summary": summary_text,
        "action_items_count": len(action_items),
        "duration": duration_str
    }

def create_fallback_summary(text):
    sentences = [s.strip() for s in text.split('.') if s.strip()][:3]
    return '. '.join(sentences) if sentences else "Meeting discussion completed."

def transcribe_with_groq(audio_path):
    api_key = os.environ.get("GROQ_API_KEY")
    result_json = None
    file_size = os.path.getsize(audio_path) if os.path.exists(audio_path) else 0
    
    if not api_key:
        return json.dumps({"error": "GROQ_API_KEY not set. Get free key at https://console.groq.com/"})
    
    validation_error = validate_audio_file(audio_path)
    if validation_error:
        logger.error(f"File validation failed [{audio_path}]: {validation_error}")
        return json.dumps({"error": f"Invalid file: {validation_error}"})
    
    try:
        from groq import Groq
        client = Groq(api_key=api_key, timeout=REQUEST_TIMEOUT)
        
        logger.info(f"Processing started [{audio_path}] ({file_size / 1024:.1f} KB)")
        
        with open(audio_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(audio_path, file.read()),
                model="whisper-large-v3",
                response_format="verbose_json",
                language="en"
            )
        
        text = transcription.text
        duration = getattr(transcription, 'duration', None)
        
        if duration and duration > MAX_DURATION_SECONDS:
            logger.error(f"Audio too long [{audio_path}]: {duration:.1f}s (max: {MAX_DURATION_SECONDS}s)")
            return json.dumps({"error": f"Audio too long: {duration:.1f} seconds (max: {MAX_DURATION_SECONDS} seconds)"})
        
        logger.info(f"Transcription complete, extracting action items...")
        
        action_items = extract_action_items_with_llm(client, text)
        summary = generate_summary(client, text, action_items, duration)
        
        result = {
            "text": text,
            "language": "en",
            "action_items": action_items,
            "summary": summary
        }
        
        result_json = json.dumps(result)
        logger.info(f"Processing complete [{audio_path}]: {len(action_items)} action items, {len(text)} chars transcript")
        return result_json
        
    except ImportError:
        return json.dumps({"error": "Install groq: pip install groq"})
    except Exception as e:
        error_msg = str(e)
        if "invalid" in error_msg.lower() or "corrupt" in error_msg.lower():
            logger.error(f"Corrupted/invalid audio [{audio_path}]: {error_msg}")
            return json.dumps({"error": f"Invalid audio file: {error_msg}"})
        logger.error(f"Transcription failed [{audio_path}]: {error_msg}")
        return json.dumps({"error": error_msg})
    finally:
        cleanup_file(audio_path)

def cleanup_file(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        logger.warning(f"Failed to cleanup {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = transcribe_with_groq(audio_path)
    print(result)
