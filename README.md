# Meeting Analyzer

Extract actionable insights from your meeting recordings with AI-powered transcription.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat&logo=spring-boot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=java)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## What It Does

Upload any meeting recording and instantly get:

- **Transcript** — Accurate speech-to-text conversion
- **Action Items** — Tasks identified with assignee, deadline & priority  
- **Summary** — Concise meeting overview

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React · Tailwind CSS |
| Backend | Spring Boot · Java 17 |
| AI | Groq Whisper API |

---

## Quick Start

```bash
# Clone
git clone https://github.com/sandeshgorde/audio-action-extractor-meetings.git
cd audio-action-extractor-meetings

# Backend
cd backend
export GROQ_API_KEY="your_key"
pip install groq
mvn spring-boot:run

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Open **http://localhost:3000**

---

## API

```bash
curl -X POST http://localhost:8080/api/upload-audio \
  -F "file=@meeting.mp3"
```

---

## License

[MIT](LICENSE)
