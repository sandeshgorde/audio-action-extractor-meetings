# Meeting Analyzer

An AI-powered meeting assistant that extracts action items from audio recordings.

## Architecture (100% Free Deployment)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│   Vercel UI     │────▶│   Railway API   │
│   (Frontend)    │     │   (React)       │     │   (Spring Boot) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │   Groq API      │
                                                   │  (Whisper AI)   │
                                                   └─────────────────┘
```

**Free Tier:**
- **Frontend:** Vercel - Unlimited
- **Backend:** Railway - 500 hours/month
- **AI:** Groq API - 500 minutes/month

---

## Quick Start (Local)

### Prerequisites

- Java 17+
- Node.js 18+
- Python 3.8+

### 1. Get Groq API Key (Free)

1. Go to https://console.groq.com/
2. Sign up with GitHub
3. Create API key (free - 500 min/month)
4. Copy the key

### 2. Run Backend

```bash
cd backend

# Set Groq API key
export GROQ_API_KEY="your_groq_key"

# Install Groq SDK
pip install groq

# Run
mvn spring-boot:run
```

### 3. Run Frontend

```bash
cd frontend
npm install
npm start
```

---

## Deployment (100% Free)

### Step 1: Deploy Backend on Railway

1. Go to https://railway.app/
2. Sign up with GitHub
3. Create "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable:
   - `GROQ_API_KEY` = your_groq_api_key
6. Deploy!

### Step 2: Deploy Frontend on Vercel

1. Go to https://vercel.com/
2. Sign up with GitHub  
3. "Add New" → Select your repo
4. Select "frontend" folder
5. Add variable:
   - `REACT_APP_API_URL` = your_railway_backend_url
6. Deploy!

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| GROQ_API_KEY | Get from https://console.groq.com/ |
| PORT | Server port (default: 8080) |

---

## API

```bash
curl -X POST https://your-backend.railway.app/api/upload-audio \
  -F "file=@meeting.mp3"
```

Response:
```json
{
  "success": true,
  "transcript": "Meeting discussion...",
  "action_items": [{"task": "...", "assigned_to": "John", "deadline": "Friday", "priority": "high"}],
  "summary": {"text": "...", "action_items_count": 3}
}
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Tailwind CSS |
| Backend | Spring Boot 3.2, Java 17 |
| AI | Groq Whisper API |
| Hosting | Vercel + Railway |

---

## License

MIT
