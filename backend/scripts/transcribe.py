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

VALID_PRIORITIES = {"high", "medium", "low"}

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

def extract_action_items_with_llm(client, text):
    prompt = """You are a meeting assistant. Analyze the following meeting transcript and extract action items.

For each action item, identify:
- task: The specific action to be taken (clear and concise, max 100 chars)
- assigned_to: The person responsible (extract from context, or "Unassigned" if not mentioned)
- deadline: When the task should be completed (extract from context, or "Not specified" if not mentioned)
- priority: "high", "medium", or "low" (based on urgency)

Return a JSON array of action items. Only include items that are actual tasks/assignments, not general discussions.

Transcript:""" + text

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a meeting assistant. Respond ONLY with a valid JSON array. No markdown, no explanations."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1024
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'^```\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        
        parsed = json.loads(response_text)
        validated = validate_llm_response(parsed, text, is_action_items=True)
        
        if not validated:
            print(f"[WARN] LLM returned empty/invalid action items, using fallback", file=sys.stderr)
            return create_fallback_action_items(text)
        
        return validated
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON parse failed: {e}", file=sys.stderr)
        print(f"[DEBUG] Raw LLM response: {response_text[:500] if 'response_text' in locals() else 'N/A'}", file=sys.stderr)
        return create_fallback_action_items(text)
    except Exception as e:
        print(f"[ERROR] LLM extraction failed: {e}", file=sys.stderr)
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

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system", 
                    "content": "You are a meeting assistant. Respond ONLY with valid JSON."
                },
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=256
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'^```\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        
        parsed = json.loads(response_text)
        summary_text = validate_llm_response(parsed, text, is_action_items=False)
        
        if not summary_text:
            summary_text = create_fallback_summary(text)
            
    except Exception as e:
        print(f"[ERROR] Summary generation failed: {e}", file=sys.stderr)
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
    
    if not api_key:
        return json.dumps({"error": "GROQ_API_KEY not set. Get free key at https://console.groq.com/"})
    
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        
        with open(audio_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(audio_path, file.read()),
                model="whisper-large-v3",
                response_format="verbose_json",
                language="en"
            )
        
        text = transcription.text
        duration = getattr(transcription, 'duration', None)
        
        action_items = extract_action_items_with_llm(client, text)
        summary = generate_summary(client, text, action_items, duration)
        
        result = {
            "text": text,
            "language": "en",
            "action_items": action_items,
            "summary": summary
        }
        
        cleanup_file(audio_path)
        return json.dumps(result)
        
    except ImportError:
        cleanup_file(audio_path)
        return json.dumps({"error": "Install groq: pip install groq"})
    except Exception as e:
        cleanup_file(audio_path)
        return json.dumps({"error": str(e)})

def cleanup_file(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"[WARN] Failed to cleanup {file_path}: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = transcribe_with_groq(audio_path)
    print(result)
