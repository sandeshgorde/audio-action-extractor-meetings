# Meeting Analyzer

Extract actionable insights from your meeting recordings with AI-powered transcription.

---

## What It Does

1. **Upload** your meeting audio (MP3, WAV, M4A, etc.)
2. **Transcribe** using Groq Whisper AI
3. **Extract** action items, priorities, assignees, and deadlines
4. **Get** a professional summary

It's free - no account needed.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 |
| Backend | Spring Boot 3.2 (Java 17) |
| AI | Groq Whisper + LLaMA 3.3 |
| Deployment | Vercel + Render |

---

## Prerequisites

### Windows
- **Java:** https://adoptium.net/ (Version 17 or higher)
- **Node.js:** https://nodejs.org/ (Version 18 or higher)
- **Maven:** https://maven.apache.org/download.cgi

### Linux (Ubuntu/Pop!_OS)
```bash
# Install Java
sudo apt update
sudo apt install openjdk-17-jdk

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install Maven
sudo apt install maven
```

---

## Quick Setup (Windows)

### Step 1: Get the Code
1. Go to https://github.com/sandeshgorde/audio-action-extractor-meetings
2. Click green "Code" button → "Download ZIP"
3. Extract the ZIP file
4. Open Command Prompt (type `cmd` in Start menu)
5. Go to the extracted folder:
```cmd
cd C:\Users\YourName\Downloads\audio-action-extractor-meetings
```

### Step 2: Get Free Groq API Key
1. Go to https://console.groq.com/
2. Sign up (free account)
3. Click "API Keys" → "Create Key"
4. Copy the key (it looks like `gsk_...`)

### Step 3: Set Up Backend
1. In Command Prompt, go to backend folder:
```cmd
cd backend
```

2. Create environment file:
```cmd
notepad .env
```
3. Type this in the notepad that opens:
```
GROQ_API_KEY=your_api_key_here
```
4. Save and close notepad

5. Run the backend:
```cmd
mvn spring-boot:run
```
Wait 10-20 seconds until you see "Started AudioExtractorApplication"

### Step 4: Set Up Frontend
1. Open a **new** Command Prompt window
2. Go to the project folder:
```cmd
cd C:\Users\YourName\Downloads\audio-action-extractor-meetings
```
3. Go to frontend:
```cmd
cd frontend
```
4. Install and run:
```cmd
npm install
npm start
```

### Step 5: Use the App
1. Your browser should open automatically to http://localhost:3000
2. Click "Get Started"
3. Upload an audio file
4. Click "Analyze"

---

## Quick Setup (Linux)

### Step 1: Get the Code
```bash
git clone https://github.com/sandeshgorde/audio-action-extractor-meetings.git
cd audio-action-extractor-meetings
```

### Step 2: Get Free Groq API Key
1. Go to https://console.groq.com/
2. Sign up (free account)
3. Create an API key

### Step 3: Set Up and Run
```bash
# Backend
cd backend
echo "GROQ_API_KEY=your_api_key" > .env
mvn spring-boot:run

# Frontend (in a new terminal)
cd frontend
npm install
npm start
```

---

## Troubleshooting

**Backend won't start?**
- Make sure Java 17 is installed: `java -version`
- Make sure `.env` file has your API key (no quotes, just the key)

**Frontend shows error?**
- Make sure backend is running first
- Wait 10 seconds for backend to start

**"Cannot connect to server" error?**
- Check backend is running in its own terminal
- Make sure you see "Started AudioExtractorApplication" in backend terminal

---

## Access (Running Locally)

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8080

---

## License

MIT