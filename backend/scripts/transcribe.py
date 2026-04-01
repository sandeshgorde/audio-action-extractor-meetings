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

def transcribe_with_groq(audio_path):
    api_key = os.environ.get("GROQ_API_KEY")
    
    if not api_key:
        return json.dumps({
            "error": "GROQ_API_KEY not set. Get free key at https://console.groq.com/"
        })
    
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
        summary = generate_summary(text, action_items, duration)
        
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

def extract_action_items_with_llm(client, text):
    prompt = """You are a meeting assistant. Analyze the following meeting transcript and extract action items.

For each action item, identify:
- task: The specific action to be taken (clear and concise)
- assigned_to: The person responsible (extract from context, or "Unassigned" if not mentioned)
- deadline: When the task should be completed (extract from context, or "Not specified" if not mentioned)
- priority: high, medium, or low (based on urgency mentioned)

Return a JSON array of action items. Only include items that are actual tasks/assignments, not general discussions.

Example output:
[
  {"task": "Send project proposal to client", "assigned_to": "John", "deadline": "Friday", "priority": "high"},
  {"task": "Review quarterly budget", "assigned_to": "Sarah", "deadline": "Next Monday", "priority": "medium"}
]

Transcript:""" + text

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a meeting assistant that extracts action items. Always respond with valid JSON array only, no additional text."
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
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        action_items = json.loads(response_text.strip())
        
        if isinstance(action_items, list):
            return action_items[:10]
        return []
        
    except json.JSONDecodeError as e:
        print(f"Warning: Failed to parse LLM response: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Warning: LLM extraction failed: {e}", file=sys.stderr)
        return []

def generate_summary(text, action_items, duration=None):
    prompt = f"""Summarize this meeting transcript in 2-3 sentences. Focus on the main topics discussed and outcomes.

Transcript: {text}

Respond with JSON: {{"summary": "your summary here"}}
"""

    try:
        from groq import Groq
        api_key = os.environ.get("GROQ_API_KEY")
        client = Groq(api_key=api_key)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system", 
                    "content": "You are a meeting assistant. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=256
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        summary_data = json.loads(response_text.strip())
        summary_text = summary_data.get("summary", "Meeting discussion completed.")
        
    except Exception:
        sentences = text.split('.')[:3]
        summary_text = '. '.join(sentences).strip() if sentences else "Meeting discussion completed."
    
    duration_str = f"{duration:.1f} seconds" if duration else f"{len(text.split()) * 0.5:.1f} seconds"
    
    return {
        "summary": summary_text,
        "action_items_count": len(action_items),
        "duration": duration_str
    }

def cleanup_file(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Failed to cleanup {file_path}: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = transcribe_with_groq(audio_path)
    print(result)
