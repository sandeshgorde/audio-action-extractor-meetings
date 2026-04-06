# Meeting Analyzer — Frontend

React 18 frontend for the [Meeting Analyzer](https://github.com/sandeshgorde/audio-action-extractor-meetings) project. Upload meeting audio, get AI-generated transcripts, action items, priorities, assignees, and summaries.

> **This repo is the frontend only.** It proxies API calls to the backend running on `localhost:8080`. Make sure the backend is running before using the app.

---

## Tech Stack

- React 18 + React Router
- Create React App (react-scripts 5)
- Proxy → Spring Boot backend at `localhost:8080`

---

## Prerequisites

You need **Node.js 18+** and **npm** installed.

### Check if you already have it

```bash
node -v
npm -v
```

If not installed, follow the section for your OS below.

---

## Setup on Pop!_OS (Linux)

### 1. Install Node.js via nvm (recommended)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Restart your terminal, then:

```bash
nvm install 18
nvm use 18
node -v   # should print v18.x.x
```

### 2. Clone the repo

```bash
git clone https://github.com/sandeshgorde/frontend-of-our-project.git
cd frontend-of-our-project
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the dev server

```bash
npm start
```

App opens at **http://localhost:3000**

> API calls are proxied to `http://localhost:8080` — make sure your Spring Boot backend is running or you'll get network errors on the analyzer page.

---

## Setup on Windows

### 1. Install Node.js

Download the **LTS installer** from [nodejs.org](https://nodejs.org) and run it. It installs both `node` and `npm` automatically.

Verify in **Command Prompt** or **PowerShell**:

```powershell
node -v
npm -v
```

### 2. Clone the repo

```powershell
git clone https://github.com/sandeshgorde/frontend-of-our-project.git
cd frontend-of-our-project
```

> If you don't have Git, download it from [git-scm.com](https://git-scm.com/download/win)

### 3. Install dependencies

```powershell
npm install
```

### 4. Start the dev server

```powershell
npm start
```

App opens at **http://localhost:3000**

> If Windows Firewall asks for network access, click **Allow**.

---

## Project Structure

```
frontend-of-our-project/
├── public/
│   ├── index.html
│   ├── photo1.jpg          # Used in landing page sections
│   ├── photo2.jpg
│   └── photo3.jpg
├── src/
│   ├── App.js              # Router setup (/ and /analyzer routes)
│   ├── LandingPage.js      # Marketing landing page
│   ├── Analyzer.js         # Main app — audio upload + results
│   ├── index.css           # Global styles
│   └── index.js            # React entry point
└── package.json
```

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm start` | Runs dev server at localhost:3000 with hot reload |
| `npm run build` | Builds production bundle into `/build` |
| `npm test` | Runs tests |

---

## Environment / Proxy

The `package.json` has:

```json
"proxy": "http://localhost:8080"
```

This means any `/api/*` request from the frontend automatically forwards to the backend during development. **No `.env` file needed for local dev.**

For production, the frontend is deployed on **Vercel** and the backend on **Render** — the API URL is hardcoded for the deployed environment in `Analyzer.js`.

---

## Related

- [Backend repo](https://github.com/sandeshgorde/audio-action-extractor-meetings) — Spring Boot + Python transcription
