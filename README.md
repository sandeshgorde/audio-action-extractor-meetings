# Audio Action Extractor Meetings

Extract actionable insights from your meeting recordings with AI-powered transcription.

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

### 2. Get Groq API Key

1. Visit https://console.groq.com/
2. Sign up and create an API key
3. Copy the key

### 3. Backend Setup

**Linux / macOS:**
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install groq

# Build the project
mvn clean package -DskipTests

# Set API key
export GROQ_API_KEY="your_groq_key"

# Run backend
mvn spring-boot:run
```

**Windows (CMD):**
```cmd
cd backend

python -m venv venv
venv\Scripts\activate

pip install groq

mvn clean package -DskipTests

set GROQ_API_KEY=your_groq_key

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
