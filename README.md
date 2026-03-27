# Meeting Analyzer

AI-powered meeting assistant that extracts action items from audio recordings.

## Architecture (100% Free)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Vercel    │────▶│   Render    │
│  (Frontend) │     │   (React)   │     │  (Backend)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │   Groq API  │
                                    │  (Whisper) │
                                    └─────────────┘
```

**Free Tier:**
- **Frontend:** Vercel - Unlimited
- **Backend:** Render - 750 hours/month
- **AI:** Groq - 500 minutes/month

---

## Quick Start (Local)

### Get Groq API Key

1. https://console.groq.com/
2. Sign up → Create API key
3. Free: 500 min/month

### Run Backend

```bash
cd backend
export GROQ_API_KEY="your_key"
pip install groq
mvn spring-boot:run
```

### Run Frontend

```bash
cd frontend
npm install
npm start
```

---

## Deploy (100% Free)

### 1. Backend → Render.com

1. Go to https://render.com/
2. Connect GitHub → Select repo
3. Create "Web Service"
4. Settings:
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -Xmx512m -Xms256m -Dserver.port=$PORT -jar target/audio-action-extractor-1.0.0.jar`
5. Add Env Vars:
   - `GROQ_API_KEY` = your_groq_key
6. Deploy!

### 2. Frontend → Vercel.com

1. Go to https://vercel.com/
2. Connect GitHub → Select repo
3. Select "frontend" folder
4. Add Env Var:
   - `REACT_APP_API_URL` = your_render_url
5. Deploy!

---

## API

```bash
curl -X POST https://your-render-app.onrender.com/api/upload-audio \
  -F "file=@meeting.mp3"
```

---

## Tech Stack

| Component | Service |
|-----------|---------|
| Frontend | React, Vercel |
| Backend | Spring Boot, Render |
| AI | Groq Whisper |

---

## License

MIT
