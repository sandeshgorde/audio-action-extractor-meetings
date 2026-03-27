#!/usr/bin/env python3
import sys
import whisper
import json
import torch
import re

def extract_action_items(text):
    action_items = []
    
    patterns = [
        r'(?:need to|should|will|must|has to|have to)\s+([^.!?]+)',
        r'(?:assign|assigned)\s+(?:to\s+)?(\w+)',
        r'(?:by|before|due|deadline)\s+([^.,!?]+)',
        r'(?:high|medium|low)\s+priority',
        r'task:\s*([^.]+)',
        r'action:\s*([^.]+)',
    ]
    
    action_keywords = ['complete', 'finish', 'send', 'email', 'call', 'schedule', 'prepare', 'review', 'update', 'create', 'finish', 'submit', 'check', 'contact', 'organize', 'set up', 'book', 'arrange']
    
    sentences = re.split(r'[.!?]\s+', text.lower())
    
    for i, sentence in enumerate(sentences):
        sentence = sentence.strip()
        if any(keyword in sentence for keyword in action_keywords):
            task = sentence
            
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
            elif re.search(r'\blow priority\b|\bwhen possible\b', sentence):
                priority = "low"
            
            action_items.append({
                "task": task.title() if task else "",
                "assigned_to": assigned if assigned else "Unassigned",
                "deadline": deadline if deadline else "Not specified",
                "priority": priority
            })
    
    return action_items[:5]

def generate_summary(text, action_items):
    sentences = re.split(r'[.!?]\s+', text)
    
    key_points = []
    for sentence in sentences[:5]:
        sentence = sentence.strip()
        if len(sentence) > 20:
            key_points.append(sentence)
    
    summary = " ".join(key_points[:3]) if key_points else "Meeting discussion completed."
    
    return {
        "summary": summary.strip(),
        "action_items_count": len(action_items),
        "duration_estimate": f"{len(sentences) * 30} seconds"
    }

def transcribe_audio(audio_path):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = whisper.load_model("base", device=device)
    
    result = model.transcribe(audio_path, verbose=False)
    
    text = result["text"]
    action_items = extract_action_items(text)
    summary_info = generate_summary(text, action_items)
    
    return json.dumps({
        "text": text,
        "language": result.get("language", "unknown"),
        "action_items": action_items,
        "summary": summary_info
    })

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    
    try:
        result = transcribe_audio(audio_path)
        print(result)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
