# Meeting Analyzer

Extract actionable insights from your meeting recordings with AI-powered transcription.

🔗 **Live App:** https://audio-action-extractor-meetings.vercel.app

---

## What It Does

1. **Upload** your meeting audio (MP3, WAV, M4A, FLAC, OGG — max 50MB)
2. **Transcribe** using Groq Whisper Large V3
3. **Extract** action items, priorities, assignees, and deadlines
4. **Get** a professional AI-written summary

Free forever · No account needed · Results in seconds

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, React Router v7 |
| Backend | Spring Boot 3.2, Java 17 |
| Transcription | Groq Whisper Large V3 |
| AI Analysis | LLaMA 3.3 70B via Groq |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Local Setup — Windows (Step by Step)

> ⏱️ Takes about 20–30 minutes the first time. After setup, starting the app takes 10 seconds.

---

### Step 1 — Install Git

Git is used to download the project code.

1. Go to **https://git-scm.com/download/win**
2. Download and run the installer
3. Click **Next** on every screen — keep all defaults
4. Click **Finish**

Verify — open **Command Prompt** (`Win + R` → type `cmd` → Enter):
```cmd
git --version
```
✅ You should see `git version 2.x.x`

---

### Step 2 — Install Java 17

1. Go to **https://adoptium.net**
2. Make sure it shows **Temurin 17 (LTS)** — if not, click "Other platforms" and select Version **17**, OS **Windows**, Architecture **x64**
3. Download the **.msi** installer and run it
4. On the "Custom Setup" screen, make sure **"Set JAVA_HOME variable"** is ticked ✅
5. Click **Next** → **Install** → **Finish**

Verify:
```cmd
java -version
```
✅ Should show `openjdk version "17.x.x"`

> ⚠️ If you see `'java' is not recognized` — close Command Prompt, reopen it, and try again. Still failing? Restart your PC.

---

### Step 3 — Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the left button)
3. Run the installer → keep all defaults → Finish

Verify:
```cmd
node -v
npm -v
```
✅ Both should print version numbers

---

### Step 4 — Install Maven

Maven builds the Java backend.

1. Go to **https://maven.apache.org/download.cgi**
2. Under "Binary zip archive", download `apache-maven-3.x.x-bin.zip`
3. Extract the zip to `C:\Program Files\Maven\` (create the Maven folder if it doesn't exist)
4. Add Maven to PATH so Windows can find it:
   - Press `Win + S` → search **"Edit the system environment variables"** → open it
   - Click **Environment Variables** button
   - Under **System variables**, find **Path** → click **Edit**
   - Click **New** → type the path to Maven's `bin` folder:
     ```
     C:\Program Files\Maven\apache-maven-3.9.6\bin
     ```
     *(replace `3.9.6` with your actual version number)*
   - Click **OK → OK → OK**
5. **Close and reopen Command Prompt**

Verify:
```cmd
mvn -version
```
✅ Should show `Apache Maven 3.x.x`

> 💡 **Easier alternative:** Install Chocolatey and run `choco install maven -y`. Guide at https://chocolatey.org/install

---

### Step 5 — Get a Free Groq API Key

The app uses Groq's API for transcription and AI. It's completely free.

1. Go to **https://console.groq.com**
2. Sign up (Google login works)
3. In the left sidebar, click **API Keys**
4. Click **Create API Key** → give it any name → **Submit**
5. **Copy the key** — it looks like `gsk_xxxxxxxxxxxxxxxxxxxx`

> ⚠️ Save this key now — you won't be able to see it again after closing the popup.

---

### Step 6 — Clone the Project

```cmd
cd %USERPROFILE%\Desktop
git clone https://github.com/sandeshgorde/audio-action-extractor-meetings.git
cd audio-action-extractor-meetings
```

The project folder is now on your Desktop.

---

### Step 7 — Set Up the API Key

1. Navigate into the backend folder:
```cmd
cd backend
```

2. Create the `.env` file:
```cmd
notepad .env
```

3. In Notepad, type exactly this (replace with your real key):
```
GROQ_API_KEY=gsk_your_actual_key_here
```

4. Save (`Ctrl + S`) and close Notepad

> ⚠️ No quotes around the key. Just `GROQ_API_KEY=gsk_...` on a single line. File must be named `.env` not `.env.txt`

---

### Step 8 — Build the Backend

Still inside the `backend` folder:
```cmd
mvn clean package -DskipTests
```

First time takes **3–5 minutes** — it downloads all Java dependencies.

✅ You should see `BUILD SUCCESS` at the end

> ⚠️ If you see `BUILD FAILURE` — make sure `java -version` shows 17 and that you are inside the `backend` folder.

---

### Step 9 — Install Frontend Dependencies

Open a **new** Command Prompt window:
```cmd
cd %USERPROFILE%\Desktop\audio-action-extractor-meetings\frontend
npm install
```

Takes 1–2 minutes. ✅

---

### Step 10 — Run the App

Go to the **project root folder** and run:
```cmd
cd %USERPROFILE%\Desktop\audio-action-extractor-meetings
start.bat
```

Or just **double-click `start.bat`** in File Explorer.

Wait **15–20 seconds**, then open your browser:

### 🌐 http://localhost:3000

---

### Stopping the App

Double-click **`stop.bat`** in the project folder, or close the terminal windows that opened.

---

### Running Again Later

Setup is one-time only. Next time you just need to:
1. Open the project folder
2. Double-click `start.bat`
3. Open http://localhost:3000

---

## Local Setup — Linux (Ubuntu / Pop!_OS)

```bash
# Install dependencies
sudo apt update
sudo apt install openjdk-17-jdk maven

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Clone the project
git clone https://github.com/sandeshgorde/audio-action-extractor-meetings.git
cd audio-action-extractor-meetings

# Set up API key
echo "GROQ_API_KEY=your_key_here" > backend/.env

# Build backend
cd backend && mvn clean package -DskipTests && cd ..

# Install frontend deps
cd frontend && npm install && cd ..

# Start everything
chmod +x start.sh && ./start.sh
```

Open **http://localhost:3000** ✅

---

## Troubleshooting

**`'java' is not recognized`**
Close and reopen Command Prompt. If still failing, restart your PC.

**`'mvn' is not recognized`**
You either made a typo in the Maven PATH or forgot to reopen Command Prompt after adding it. Check Step 4 — the path must end in `\bin`.

**`BUILD FAILURE` during Maven build**
- Make sure you're inside the `backend` folder
- Make sure `java -version` shows 17
- Try deleting the `target` folder and running again

**App shows "Something went wrong"**
Your `.env` file is probably wrong. Check:
- File is named exactly `.env` (not `.env.txt`)
- It's inside the `backend` folder
- Content is `GROQ_API_KEY=gsk_yourkey` with no quotes, no extra spaces

**Port 8080 already in use**
```cmd
netstat -ano | findstr ":8080"
taskkill /PID <the_number_in_last_column> /F
```

**Port 3000 already in use**
```cmd
netstat -ano | findstr ":3000"
taskkill /PID <the_number_in_last_column> /F
```

**Frontend didn't open automatically**
Manually open your browser and go to **http://localhost:3000**

---

## Project Structure

```
audio-action-extractor-meetings/
├── backend/
│   ├── src/main/java/              ← Java source code
│   ├── scripts/
│   │   └��─ transcribe.py           ← Transcription script
│   ├── .env                      ← Your API key (you create this in Step 7)
│   ├── pom.xml                    ← Maven config
│   └── target/                   ← Compiled JAR after build
├── frontend/
│   ├── src/
│   │   ├── LandingPage.js
│   │   ├── Analyzer.js
│   │   └── App.js
│   └── package.json
├── start.bat / start.sh          ← Starts both backend and frontend
├── stop.bat / stop.sh            ← Stops everything
└── README.md
```

---

## License

MIT · Built as MCA Sem II group project · Sant Gadge Baba Amravati University  
Guided by Prof. Sonal Shirbhate