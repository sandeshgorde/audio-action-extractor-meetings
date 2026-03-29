#!/usr/bin/env python3
"""
Transcription using Groq API
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
                response_format="json",
                language="en"
            )
        
        text = transcription.text
        
        action_items = extract_action_items(text)
        summary = generate_summary(text, action_items)
        
        return json.dumps({
            "text": text,
            "language": "en",
            "action_items": action_items,
            "summary": summary
        })
        
    except ImportError:
        return json.dumps({"error": "Install groq: pip install groq"})
    except Exception as e:
        return json.dumps({"error": str(e)})

def extract_action_items(text):
    action_items = []
    
    action_keywords = ['need to', 'should', 'will', 'must', 'task', 'action', 'complete', 'finish', 'send', 'email', 'call', 'schedule', 'prepare', 'review', 'update', 'create', 'submit', 'check', 'contact', 'follow up', 'make sure', 'ensure', 'coordinate', 'present', 'deliver', 'fix', 'resolve', 'implement', 'discuss']
    
    sentences = re.split(r'[.!?]\s+', text.lower())
    
    for sentence in sentences:
        sentence = sentence.strip()
        if any(keyword in sentence for keyword in action_keywords):
            original_sentence = sentence
            assigned = None
            assign_match = re.search(r'(?:assign|assigned|responsible)[:\s]+(\w+)', sentence)
            if assign_match:
                assigned = assign_match.group(1).title()
            
            deadline = None
            deadline_match = re.search(r'(?:by|before|due|deadline)[:\s]+([a-zA-Z0-9,\s]+)', sentence)
            if deadline_match:
                deadline = deadline_match.group(1).strip()
            
            priority = "medium"
            if re.search(r'\bhigh priority\b|\burgent\b|\basap\b', sentence):
                priority = "high"
            elif re.search(r'\blow priority\b', sentence):
                priority = "low"
            
            action_items.append({
                "task": original_sentence,
                "assigned_to": assigned if assigned else "Unassigned",
                "deadline": deadline if deadline else "Not specified",
                "priority": priority
            })
    
    return action_items[:10]

def generate_summary(text, action_items):
    sentences = text.split('.')[:3]
    summary = '. '.join(sentences).strip()
    
    return {
        "summary": summary if summary else "Meeting discussion completed.",
        "action_items_count": len(action_items),
        "duration_estimate": f"{len(text.split()) * 0.5} seconds"
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = transcribe_with_groq(audio_path)
    print(result)
