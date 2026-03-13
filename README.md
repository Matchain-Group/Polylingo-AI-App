[README.md] Full Brief Doc:(https://github.com/user-attachments/files/25965226/PolyLingo-AI-README.1.pdf)
# 🌐 PolyLingo AI
### *Break Every Language Barrier. Instantly.*

> AI-Powered Translation & Language Intelligence for the Modern World

![MVP v1.0](https://img.shields.io/badge/MVP-v1.0-1A6FE8?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-00A86B?style=for-the-badge)
![Powered by OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI-7B2FBE?style=for-the-badge)
![Built by Matchain Group](https://img.shields.io/badge/Built%20by-Matchain%20Group-0D1B2A?style=for-the-badge)

📄 **[Download Full Product Brief (Word Doc)](https://github.com/user-attachments/files/25965226/PolyLingo-AI-README.1.pdf)

---

## ✨ See It In Action

### 🖼️ App Screenshot

![PolyLingo AI — Translation Hub](https://github.com/user-attachments/assets/f16c9d13-f5c0-4ece-be82-3ab09edf8378)

---

### 🎬 Live Demo Video

> Click the thumbnail below to watch PolyLingo AI in action

[![Watch PolyLingo AI Demo](https://github.com/user-attachments/assets/f16c9d13-f5c0-4ece-be82-3ab09edf8378)](https://github.com/user-attachments/assets/bf02b5f6-2b9a-41b0-85b2-fcc314bf84b3)

▶️ **[Click here to watch the full demo](https://github.com/user-attachments/assets/bf02b5f6-2b9a-41b0-85b2-fcc314bf84b3)**

---

## 📖 What is PolyLingo AI?

PolyLingo AI is an intelligent, full-stack language translation platform built for a world that speaks thousands of languages but moves at the speed of one.

Powered by **OpenAI's large language models**, PolyLingo AI doesn't just translate words — it understands context, preserves tone, and delivers meaning. With **6 powerful translation modes**, a Telegram bot, secure authentication, and a scalable monorepo architecture — this is language intelligence built for the real world.

> **This is not a dictionary lookup. This is language intelligence.**

---

## 🔍 The Problem We Solve

| Who Feels This | The Pain Point |
|---|---|
| 🎓 Students & Researchers | Valuable academic content exists in languages they can't read |
| 🏢 Businesses & Teams | Deals fall apart and global expansion stalls due to language friction |
| ✈️ Travelers & Expats | Real-time navigation and local communication becomes frustrating |
| 💬 Content Creators | Reaching global audiences requires slow, expensive manual translation |
| 🤝 NGOs & Communities | Aid workers struggle to communicate across linguistic divides |

---

## ⚡ Core Features

PolyLingo AI comes packed with **6 translation modes** — all in one clean, dark-themed interface:

| Mode | What It Does |
|---|---|
| 📺 **Live Subtitle** | Real-time subtitle translation as you type or speak |
| 📄 **PDF** | Upload and translate entire PDF documents instantly |
| 💬 **Chat** | Live bilingual chat — communicate across languages in real time |
| 🎙️ **Voice** | Speak in one language, get translation delivered back in another |
| 📁 **Project** | Translate full projects and multi-file workloads in one go |
| 🤖 **Telegram Bot** | Use PolyLingo directly inside Telegram — no browser needed |

### Plus:
- 🔍 **Auto Language Detection** — paste anything, PolyLingo identifies and translates
- 🔐 **Secure Authentication** — JWT auth with bcrypt password hashing
- 🗄️ **Persistent Storage** — Drizzle ORM database for history and preferences
- 🧩 **Monorepo Architecture** — pnpm workspaces for clean, scalable structure

---

## 🔄 How It Works

```
1. USER INPUT     → Type, paste, speak, or upload via any of the 6 modes
2. AUTO DETECT    → PolyLingo identifies the source language automatically
3. AI PROCESSING  → OpenAI understands context, tone, and intent — not just words
4. DELIVERY       → Translated result returned instantly to UI or Telegram
5. STORAGE        → Translation saved to database for history tracking
```

---

## 🛠️ Tech Stack

| Frontend | Backend | AI & Integrations | Infrastructure |
|---|---|---|---|
| Vite | Node.js + Express | OpenAI API | pnpm Workspaces |
| TypeScript | TypeScript (tsx) | Telegram Bot API | Monorepo Architecture |
| React | Drizzle ORM | | Replit / Cloud Deploy |
| | JWT + bcrypt Auth | | |

---

## 🚀 Current MVP Status

### ✅ Built & Working
- Full API server with JWT authentication (register, login, sessions)
- OpenAI-powered translation engine — live and integrated
- 6 translation modes: Live Subtitle, PDF, Chat, Voice, Project, Telegram Bot
- Auto language detection
- Telegram bot for on-the-go translations
- Translation Hub frontend — clean dark UI for web access
- Database layer with Drizzle ORM
- Monorepo with pnpm workspaces

### 🛣️ Coming Next
- 50+ additional language support
- Expanded document format support (DOCX, TXT, SRT)
- User translation history dashboard
- Team & workspace features for businesses
- Public API for third-party developers
- Mobile app (iOS & Android)

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- pnpm: `npm install -g pnpm`
- OpenAI API key — [platform.openai.com](https://platform.openai.com)
- Telegram Bot token — via [@BotFather](https://t.me/botfather) on Telegram

### Installation

```bash
# Clone the repository
git clone https://github.com/Matchain-Group/Polylingo-AI-App
cd Polylingo-AI-App

# Install all dependencies
pnpm install

# Start the API server
cd artifacts/api-server && pnpm dev

# Start the Translation Hub frontend (new terminal)
cd artifacts/translation-hub && pnpm dev
```

### Environment Variables

Create a `.env` file inside `artifacts/api-server/`:

```env
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_key_here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
TELEGRAM_BOT_TOKEN=your_telegram_token_here
JWT_SECRET=your_super_secret_key
DATABASE_URL=your_database_url
```

---

## 💬 Share Your Feedback

> PolyLingo AI is in active development and your feedback is the most valuable thing we have right now. Every comment, suggestion, bug report, and idea goes directly into shaping what this product becomes. **We read every single message.**

### 📬 Email Us Directly

**[matchainglobalgroup@gmail.com](mailto:matchainglobalgroup@gmail.com)**

Use the subject line: **"PolyLingo Feedback"** — we'll respond within 48 hours.

**What to include:**
1. Your name and what you do
2. How you used (or would use) PolyLingo AI
3. What worked well and what could be better
4. Any feature you wish existed
5. Your overall rating from 1–10

---

## 🤝 Contributing

We believe great products are built with community. To contribute:

- Fork the repo and create a feature branch
- Follow the existing TypeScript + pnpm workspace conventions
- Open a pull request with a clear description of your changes
- Or email us at **matchainglobalgroup@gmail.com** with your ideas

---

## 📄 License

Developed and maintained by **Matchain Group**. All rights reserved for MVP v1.0.
Licensing terms for open-source components will be published with v2.0.

---

<div align="center">

**Built with ❤️ by Matchain Group**

*"Language should never be a barrier to human potential."*

[matchainglobalgroup@gmail.com](mailto:matchainglobalgroup@gmail.com) • 

</div>
