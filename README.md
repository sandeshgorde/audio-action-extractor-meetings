# Meeting Analyzer

An AI-powered meeting assistant that extracts action items, summaries, and transcripts from audio recordings using OpenAI's Whisper model.

## Features

- **Audio Transcription** - Convert audio to text using Whisper AI
- **Action Item Extraction** - Automatically identify tasks with assignee, deadline, and priority
- **Meeting Summary** - Generate concise meeting summaries
- **Modern UI** - Clean, responsive dark-themed interface

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS |
| Backend | Spring Boot 3.2, Java 17 |
| Transcription | OpenAI Whisper |
| Build | Maven, npm |

## Supported Audio Formats

MP3, WAV, M4A, FLAC, OGG, WMA, AAC (Max 50MB)

---

## Quick Start

### Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Python 3.8 or higher
- Maven 3.8+

### Windows

1. **Install Chocolatey** (if not installed):
   ```powershell
   # Run PowerShell as Admin
   Set-ExecutionPolicy Bypass -Scope Process -Force
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
   iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
   ```

2. **Install dependencies via Chocolatey**:
   ```powershell
   choco install openjdk17 nodejs python ffmpeg maven -y
   ```

3. **Clone and setup**:
   ```powershell
   git clone <repo-url>
   cd audio-action-extractor-meetings
   ```

4. **Setup Python environment**:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install openai-whisper torch
   deactivate
   ```

5. **Build backend**:
   ```powershell
   cd backend
   mvn clean package -DskipTests
   ```

6. **Install frontend**:
   ```powershell
   cd frontend
   npm install
   ```

7. **Run**:
   ```powershell
   # Double-click start.bat or run in CMD:
   start.bat
   ```

### Linux / macOS

1. **Install dependencies**:
   ```bash
   # Ubuntu/Debian
   sudo apt install openjdk-17-jdk nodejs npm python3 python3-pip ffmpeg maven
   
   # macOS (Homebrew)
   brew install openjdk@17 node npm python@3.12 ffmpeg maven
   ```

2. **Clone and setup**:
   ```bash
   git clone <repo-url>
   cd audio-action-extractor-meetings
   ```

3. **Setup Python environment**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install openai-whisper torch
   deactivate
   ```

4. **Build and run**:
   ```bash
   # Make scripts executable
   chmod +x start.sh stop.sh
   
   # Start the application
   ./start.sh
   ```

---

## Running the Application

### Windows
```cmd
start.bat
```

### Linux/macOS
```bash
./start.sh
```

### Manual Start

**Terminal 1 - Backend:**
```bash
# Windows
cd backend
java -Dpython.command=backend\venv\Scripts\python.exe -jar target\audio-action-extractor-1.0.0.jar

# Linux/Mac
java -Dpython.command=./venv/bin/python3 -jar target/audio-action-extractor-1.0.0.jar
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Access the App

Open browser: **http://localhost:3000**

---

## Project Structure

```
audio-action-extractor-meetings/
├── backend/
│   ├── src/main/java/com/audioextractor/
│   │   ├── controller/     # REST endpoints
│   │   ├── service/       # Business logic
│   │   ├── config/        # Spring configuration
│   │   ├── exception/     # Error handling
│   │   └── AudioExtractorApplication.java
│   ├── scripts/
│   │   └── transcribe.py  # Whisper integration
│   ├── uploads/           # Uploaded audio files
│   ├── venv/             # Python virtual environment
│   ├── pom.xml
│   └── target/            # Built JAR file
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main component
│   │   └── index.css     # Tailwind styles
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── start.sh / start.bat   # Start script
├── stop.sh / stop.bat     # Stop script
├── README.md
└── LICENSE
```

---

## API Endpoints

### POST /api/upload-audio

Upload an audio file for transcription.

**Request:**
```
POST http://localhost:8080/api/upload-audio
Content-Type: multipart/form-data
file: <audio_file>
```

**Response:**
```json
{
  "success": true,
  "filename": "uuid.mp3",
  "originalName": "meeting.mp3",
  "transcript": "Meeting discussion text...",
  "language": "en",
  "action_items": [
    {
      "task": "Send report to team",
      "assigned_to": "John",
      "deadline": "Friday",
      "priority": "high"
    }
  ],
  "summary": {
    "text": "Brief summary of meeting...",
    "action_items_count": 3,
    "duration_estimate": "5 minutes"
  }
}
```

---

## Troubleshooting

### Backend won't start

**Windows:**
```cmd
netstat -ano | findstr ":8080"
```

**Linux/Mac:**
```bash
lsof -i :8080
```

### Transcription fails

```bash
# Activate virtual environment
source backend/venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate          # Windows

# Verify Whisper is installed
pip list | grep whisper

# Test manually
python scripts/transcribe.py uploads/yourfile.mp3
```

### Frontend issues

```bash
cd frontend
rm -rf node_modules/.cache build
rm -rf node_modules
npm install
```

---

## Development

### Rebuild Backend
```bash
cd backend
mvn clean package -DskipTests
```

### Rebuild Frontend
```bash
cd frontend
npm run build
```

---

## License

MIT License
