# Meeting Analyzer

Extract actionable insights from your meeting recordings with AI-powered transcription.

---

## How It Works

Upload audio → Groq Whisper transcribes it → Action items extracted → Results displayed

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React · Tailwind CSS |
| Backend | Spring Boot · Java 17 |
| AI | Groq Whisper API |

---

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- Python 3.8+

---

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sandeshgorde/audio-action-extractor-meetings.git
cd audio-action-extractor-meetings
```

### 2. Environment Variables

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your GROQ_API_KEY
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
# Usually not needed for local development
```

Get your free Groq API key at https://console.groq.com/

### 3. Backend Setup

**Linux / macOS:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install groq
mvn clean package -DskipTests
mvn spring-boot:run
```

**Windows (CMD):**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install groq
mvn clean package -DskipTests
mvn spring-boot:run
```

### 4. Frontend Setup

**Linux / macOS:**
```bash
cd frontend
npm install
npm start
```

**Windows:**
```cmd
cd frontend
npm install
npm start
```

---

## Access

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8080

---

## License

MIT
